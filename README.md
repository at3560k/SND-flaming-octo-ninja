SND-flaming-octo-ninja
======================

Demo GeoExt + OpenLayers Sources with NASA Modis

Includes mapfiles reprojecting 900913 into 4326

Requires:
 * lighthttpd (to serve efficiently)
 * mapserver cgi (OTF reprojection)
 * Python with lxml (to parse capabilities WMS & generate reprojecting wms cascade layers)

Included JS Libraries:
 * ext 3.4
 * OpenLayers 2.12
 * GeoExt
 * Proj4js (presently unused)
 * GdalWarp (presently unused)

Note:  Mapfiles generated and rely upon current development structure, font-paths, etc.

License
-------

Included Libraries are mix of GPL3, and commercial with FLOSS exceptions.

Most HTML is primarily demonstrations modified from GeoExt, which is BSD licensed.

Todo
----

Lots and lots of cleanup.
