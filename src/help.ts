const HELP = `
Export OpenStreetMap to pdf

Usage:
osm2pdf [options]

Options:
-h, --help                print this page
--route                   (optional) download the route
                          you can download the GPX route file from https://graphhopper.com/maps/
                          find the desired route and click "GPX export" (gpx button)
--path                    (optional) download the route and draw the path on it
                          similar to --route option
--distance                (optional with --path option) write labels with distance in kilometres to path points
--distance-step           (optional with --distance option) distance between distance labels (kilometres); defaults to 10
--input <path/to/gpx>     (with --route or --path option) path to GPX route file
-n <latitude>   north
-w <longitude>  west
-s <latitude>   south
-e <longitude>  east      latitude or longitude of the desired map boundary (only when --route is not specified)
                          downloads a map within a defined square
--zoom <level>            (optional) map zoom (number); defaults to 12; must be < 17
--sx <integer>            (optional) amount of tiles per page horizontally; defaults to 4
--sy <integer>            (optional) amount of tiles per page vertically; defaults to 5
--output <path/to/output> (optional) the desired name of the exported pdf file

Examples:
1. Provide map boundaries

  osm2pdf --zoom=10 -n=15.1 -s=14.9 -e=13.9 -w=13.7

2. Provide a route in GPX format (can be exported at https://graphhopper.com/maps/)
  
  osm2pdf --path --zoom=15 --input=path/to/some_route.gpx --output=my-route --distance --distance-step=5

  OR (route without highlighted path)

  osm2pdf --route --zoom=15 --input=path/to/some_route.gpx --output=my-route
`;

export default function help(): void {
  console.log(HELP); // tslint:disable-line:no-console
}
