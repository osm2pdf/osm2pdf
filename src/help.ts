const HELP = `
Export OpenStreetMap to pdf

Usage:
osm2pdf [options]

Options:
-h, --help                print this page
--route                   (optional) download the route
                          you can download the GPX route file from https://graphhopper.com/maps/
                          find the desired route and click "GPX export" (gpx button)
--input <path/to/gpx>     (with --route option) path to GPX route file
-n, --north <latitude>
-w, --west <longitude>
-s, --south <latitude>
-e, --east <longitude>    latitude or longitude of the desired map boundary (only when --route is not specified)
                          downloads a map within a defined square
--zoom <level>            (optional) map zoom (number); defaults to 12; must be < 17
--sx <integer>            (optional) amount of tiles per page horizontally; defaults to 4
--sy <integer>            (optional) amount of tiles per page vertically; defaults to 5
--output <path/to/output> (optional) the desired name of the exported pdf file

Examples:
1. Provide map boundaries

  osm2pdf --zoom=10 --north=15.1 --south=14.9 --east=13.9 --west=13.7

2. Provide a route in GPX format (can be exported at https://graphhopper.com/maps/)
  
  osm2pdf --route --zoom=15 --input=path/to/some_route.gpx --output=my-route
`;

export default function help(): void {
  console.log(HELP); // tslint:disable-line:no-console
}
