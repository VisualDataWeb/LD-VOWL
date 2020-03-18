# LD-VOWL

LD-VOWL (LinkedDataVOWL) extracts ontology information out of arbitrary SPARQL endpoints and shows the extracted information in an overview visualization using the VOWL notation (with minor modifications).

## Requirements

LD-VOWL requires [Node.js](https://nodejs.org/) to be built.

## Setup

1. Download and install [Node.js](https://nodejs.org/en/download/).
2. Clone this repository running `git clone https://github.com/VisualDataWeb/LD-VOWL.git`.
3. Run `npm install` in the root directory of LD-VOWL to install the dependencies.
4. Run `npm run start` to start a local webpack development server on port 8080 or run `npm run build` for a production build.

## Build

To get a production build, run `npm run build`. After the build is finished, the results will be inside the `dist` directory.

## Deploy Hosted Version

1. Build: `npm run build`
2. Deploy: `npm run deploy`
3. LD-VOWL will be available at: <https://zazuko.github.io/LD-VOWL/>, with the build artifacts at: <https://zazuko.github.io/LD-VOWL/dist.tgz>.

## Tests

In order to run the unit tests, run `npm run test`.

## License

LD-VOWL is licensed under the MIT License. See LICENSE.txt for more details.

## Demo

A public demo is available at [http://ldvowl.visualdataweb.org](http://ldvowl.visualdataweb.org/).
