# ![Header][0]

> mad-science@ricepo

This package can compute isodistance polygons based on driving distance.

## Getting Started
```sh
$ git clone git@github.com:ricepo/isodist.git
$ cd isodist
$ npm install
```

In order to run `isodist`, you will need to download an `*.osm` file corresponding to the region
where you want to do your computation. [Geofabrik][1] is a good source of these files.

You need to place your OSM files into the `isodist/osrm` directory (create one if it does not exist).
Then run the following command to generate `.osrm` files:
```sh
$ npm run prepare
```

If this doesn't work for you, manually prepare the osrm file using contraction hierarchies or Multy-Level Dijkstra configuration. 

Next, start a local osrm server and note which port it's running on.


Finally, you are good to go! If your server is running on port 5000, run the following to generate the isodistance: 
```sh
$ OSRM_HOST=http://localhost:5001 npm run isodist < input.json
```
where input.json is described below

## Input file
You can specify all the parameters in an input file that is piped into standard input:
```json
/* input.json */
{
  "origin": {
    "type": "Point",
    "coordinates": [ -86.893386, 40.417202 ]
  },
  "map": "indiana",
  "steps": [{
      "distance": 2
  }, {
      "distance": 5
  }, {
      "distance": 7
  }]
}
```
```sh
$ npm run isodist < input.json
```

Please note that CLI arguments always override values specified in the input file.
```sh
$ npm run isodist -- --map il < input.json
# The above command will use `osrm/il.osrm`
```


## Command Line Arguments

### `--lat`
**Required**.

Latitude of the origin point.

### `--lon`
**Required**.

Longitude of the origin point.

### `-s, --step`
**Required**.

Distance at which to compute isodistance polygons.
For example, to compute isodistance polygons at 1, 2, 5 and 10 miles, use
`--step 1 --step 2 --step 5 --step 10`


### `-m, --map`
**Required**.

Name of the `.osrm` file you wish to use for routing.


### `-r, --resolution`
Optional, default: 0.2

Sampling resolution of the underlying point grid. Larger values will result in less precise
results but much faster processing. Smaller values will produce more precise results, but will
require exponentially more processing time and memory.

Having a very small resolution value may result in kinks (i.e. self-intersections) of isodistance
polygons, which cause hex-fitting to fail. You can choose to ignore them by disabling hex-fitting,
but note that presence of kinks usually indicates incorrect parameter choice.


### `-h, --hex-size`
Optional, default: 0.5

Size of hex grid cells that isodistances are fitted onto. Passing a 0 value will disable
hex grid fitting.


### `--no-deburr`
Optional, default: none

This flag instructs `isodist` not to remove isolated "islands" from isodistance geometries.


[0]: media/isodist.png
[1]: http://download.geofabrik.de
