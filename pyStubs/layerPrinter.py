#!/usr/bin/env python

"""
Horrible hack thrown together in a hurry to xpath and parse out layer strings
for copypasta into mapfile

Very specific to neo/modis

TODO: file name
TODO: group names and preserve nesting
"""

# |Results: //Layer[not(./Layer)]/Title|
#  all layers w/o sublayer

CAPABILITIES = 'neo_capabilities_1_1_1.xml'

from lxml import etree

def getTree():
    f = open(CAPABILITIES, 'r')
    tree = etree.parse(f)
    f.close()
    return tree

def getLayers(t):
    return t.xpath('//Layer[not(./Layer)]')

def getContext(layer):
    NAME = layer.xpath('./Name')[0].text
    TITLE = layer.xpath('./Title')[0].text

    # //Layer[not(./Layer)]/Style/LegendURL/OnlineResource
    try:
        LEGEND = layer.xpath('./Style/LegendURL/OnlineResource')[0] \
            .attrib['{http://www.w3.org/1999/xlink}href'] \
            .split('http://')[1]
    except:
        # e.g. blue marble
        LEGEND = None
        pass


    return locals()

def template(context):
    """
    I have no clue what I'm doing...
    """

    # to have a legend and work, we MUST have
    # status ON in every layer
    # a CLASS in every layer
    # a NAME in the class

    # We have torn out all the legend .gifs and xarged them via wget

    # TODO: parse href
    hasLegend = context['LEGEND']

    legendStr =  """
          "wms_style_rgb_legendurl_href" "%(LEGEND)s"
	  "wms_style_rgb_legendurl_width"  "200"
	  "wms_style_rgb_legendurl_height" "35"

          "wms_legendurl_href" "%(LEGEND)s"
	  "wms_legendurl_width"  "200"
	  "wms_legendurl_height" "35"
    """

    if hasLegend:
        legendStr = legendStr % context
        keyImage = " "*4 + """KEYIMAGE "%(LEGEND)s" """ % context
    else:
        legendStr = "#NO LEGEND FOUND IN GetCapabilities"
        keyImage = legendStr

    context['WMS_LEGEND'] = legendStr
    context['KEYIMAGE'] = keyImage


    st = """
LAYER
 NAME "%(NAME)s"
 TYPE RASTER
 CONNECTION "http://neowms.sci.gsfc.nasa.gov/wms/wms?"
 CONNECTIONTYPE WMS
 STATUS ON

  CLASS
    NAME "rgb"
    %(KEYIMAGE)s
  END

  METADATA
	  "wms_name"		"%(NAME)s"
	  "wms_server_version" 	"1.1.1"			#request from here to NASA service in version 1.1.1
	  "wms_srs" 		"EPSG:4326"		#request from here to NASA service must use SRS=EPSG:4326
	  "wms_abstract" 	"%(TITLE)s"
	  "wms_title" 		"%(TITLE)s"
	  "wms_format"		"image/jpeg"
          %(WMS_LEGEND)s
	  "wms_connectiontimeout" "60"
	  "wms_latlonboundingbox" "-180 -90 180 90"
	  "wms_transparent" 	"TRUE"
  END   #METADATA
END
    """

    return st % context


def main():
    tree = getTree()
    layers = getLayers(tree)

    for layer in layers:
        context = getContext(layer)
        newLayer = template(context)
        print ''
        print newLayer

if __name__ == '__main__':
    main()
