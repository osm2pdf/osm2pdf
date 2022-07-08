## 3.1.0 (July 8, 2022)

* Feature: Handle network errors - it's not necessary to rerun so often

## 3.0.0 (September 13, 2021)

### Tile servers

* Add `--tile-server` option to specify which tile servers to download from (required)
* Add `--list-tile-servers` option to list available tile servers
* Add rate limiting to limit load on tile servers


### Route

* Merge `--route` and `--path` options to a single `--route` option


### Map

* Add links between pages (turn off by `--no-links`)
* Add boundary (turn off by `--no-boundary`)
* Add contents (turn off by `--no-content`)


### tmp

* Specify tmp folder to use with `--tmp` option
  * this option can be used to continue after a download error


### Hosting

* Move repository to GitHub. Not great because it belongs to Microsoft, but previously used Gitea instance didn't allow for collaboration.
