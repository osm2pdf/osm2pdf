const HELP = `
Export OpenStreetMap to pdf

Usage:
osm2pdf [options]

=== Generic options (for Route and Area methods) ===

--zoom          map zoom (default 12)
--tile-server   url or number of the tile server (see also \`osm2pdf --list-tile-servers\`)
                  find more tile servers at https://wiki.openstreetmap.org/wiki/Tile_servers
                  please respect tile usage policies. download responsibly.
--rate-limit    how many tiles per second can be downloaded (default 10)
--output        name of the generated pdf file (".pdf" will be attached, existing files will be overwritten)
-x              tiles per page horizontally (default 4)
-y              tiles per page vertically (default 5)
--tmp           temporary folder to save downloaded tiles to (default tmp[timestamp])
                  if the folder doesn't exist, it will be created
                  you can resume failed download with this option
                  use carefully! folder will be deleted after successful download


=== Methods ===

=== Route ===

Download route, given route coordinates in GPX format

Options:
--route         execute Route method (required)
--input         path to GPX route file (required)
                  you can download the GPX route file e.g. from https://graphhopper.com/maps/
                  find the desired route and click "GPX export" (gpx button)
--no-path       don't draw path (optional)
--no-distance   don't write labels with kilometers at the path (optional)
--distance-step distance between distance labels (default 10 [kilometers])

Examples:
osm2pdf --route --input=path/to/some-route.gpx --output some-route-12 --zoom=12 --tile-server=2
osm2pdf --route --input=path/to/other-route.gpx --output other-route-13 --zoom=13 --distance-step=5 --tile-server="http://{a|b}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" --rate-limit=2


=== Area ===

Download rectangular area, given GPS boundaries

Options:
--map           execute Area method (required)
-n              latitude of the north boundary (required)
-s              latitude of the south boundary (required)
-e              longitude of the east boundary (required)
-w              longitude of the west boundary (required)
--no-content    don't add page with content (optional)
--no-boundary   don't draw boundary (optional)
--no-links      don't add links between pages (optional)

Example:
osm2pdf --map -n=50.1 -s=50 -w=14.9 -e=15 --output=some-name-15 --tile-server=3 --zoom=15


=== List Tile Servers ===

Print a list of some recommended tile servers to choose from

Options:
--list-tile-servers   (required)

Example:
osm2pdf --list-tile-servers


=== Help ===

Print help

Options:
-h, --help                print this page (required)

Example:
osm2pdf --help
`;

export default function help(): void {
  console.log(HELP); // tslint:disable-line:no-console
}
