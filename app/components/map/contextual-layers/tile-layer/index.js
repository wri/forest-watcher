// @flow
import type { ContextualLayerRenderSpec, Layer, LayersCacheStatus } from 'types/layers.types';

import React, { Component } from 'react';
import MapboxGL from '@rnmapbox/maps';

import { GFW_CONTEXTUAL_LAYERS_METADATA, MAP_LAYER_INDEXES } from 'config/constants';

import { pathForLayer } from 'helpers/layer-store/layerFilePaths';
import { vectorTileURLForMapboxURL } from 'helpers/mapbox';

import GFWVectorLayer from './gfw-vector-layer';

type Props = {
  +featureId: string,
  +isOfflineMode: boolean,
  +layer: Layer,
  +layerCache: LayersCacheStatus
};

// Fallback for layers migrated from carto to the GFW dataAPI, which aren't in GFW_CONTEXTUAL_LAYERS_METADATA
// because they're served per-user via the /contextual-layer/ endpoint rather than the hardcoded GFW_CONTEXTUAL_LAYERS list.
// dataAPI vector tile URLs look like https://tiles.globalforestwatch.org/{dataset}/latest/default/{z}/{x}/{y}.pbf,
// and their MVT source-layer name matches the dataset slug in that first path segment.
const DATA_API_DATASET_URL_REGEX = /^https?:\/\/[^/]+\/([a-z][a-z0-9_-]{2,})\//;

const dataAPIDatasetForURL = (url: ?string): ?string => {
  if (!url || !url.endsWith('.pbf')) {
    return null;
  }
  return url.match(DATA_API_DATASET_URL_REGEX)?.[1];
};

const dataAPIVectorTileMetadata = (sourceLayer: string): ContextualLayerRenderSpec => ({
  isShareable: false,
  tileFormat: 'vector',
  // Vector layers default to a black fill if unset, so a color must always be provided here
  vectorMapLayers: [
    {
      paint: { 'fill-color': '#3FBF7F', 'fill-opacity': 0.5 },
      'source-layer': sourceLayer,
      type: 'fill'
    }
  ]
});

// Renders all active imported contextual layers in settings
export default class TileContextualLayer extends Component<Props> {
  render: () => null | React$Element<any> = () => {
    const { featureId, layer, layerCache, isOfflineMode } = this.props;

    const dataAPIDataset = dataAPIDatasetForURL(layer.url);
    const layerMetadata: ContextualLayerRenderSpec =
      GFW_CONTEXTUAL_LAYERS_METADATA[layer.id] ??
      (dataAPIDataset ? dataAPIVectorTileMetadata(dataAPIDataset) : { isShareable: false, tileFormat: 'raster' });

    const tileURLTemplates = [];

    // Find and append the remote tile URL if we're not offline
    if (!isOfflineMode) {
      const layerURL = (layer.url ? vectorTileURLForMapboxURL(layer.url) : null) ?? layer.url;
      if (layerURL) {
        tileURLTemplates.push(layerURL);
      }
    }

    // Find and append the local tile path if there is one
    if (featureId) {
      const layerDownloadProgress = layerCache[featureId];

      if (layerDownloadProgress?.completed && !layerDownloadProgress?.error) {
        tileURLTemplates.push(`file:/${pathForLayer('contextual_layer', layer.id)}/{z}x{x}x{y}`);
      }
    }

    if (tileURLTemplates.length === 0) {
      return null;
    }

    const sourceID = 'imported_layer_' + layer.id;
    switch (layerMetadata.tileFormat) {
      case 'vector':
        return (
          <MapboxGL.VectorSource
            id={sourceID}
            maxZoomLevel={layerMetadata.maxZoom}
            minZoomLevel={layerMetadata.minZoom}
            tileUrlTemplates={tileURLTemplates}
          >
            {/* $FlowFixMe */}
            {layerMetadata.vectorMapLayers?.map((vectorLayer, index) => {
              return (
                <GFWVectorLayer
                  sourceID={sourceID}
                  id={'imported_layer_layer_' + layer.id + '_' + index}
                  key={index}
                  layer={vectorLayer}
                />
              );
            })}
          </MapboxGL.VectorSource>
        );
      default:
        return (
          <MapboxGL.RasterSource
            id={sourceID}
            maxZoomLevel={layerMetadata.maxZoom}
            minZoomLevel={layerMetadata.minZoom}
            tileUrlTemplates={tileURLTemplates}
          >
            <MapboxGL.RasterLayer
              id={'imported_layer_layer_' + layer.id}
              sourceId={sourceID}
              layerIndex={MAP_LAYER_INDEXES.contextualLayer}
              style={{ rasterResampling: 'nearest' }}
            />
          </MapboxGL.RasterSource>
        );
    }
  };
}
