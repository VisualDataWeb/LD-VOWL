# LD-VOWL

LD-VOWL (LinkedDataVOWL) extracts ontology information out of arbitrary SPARQL endpoints and shows the extracted information in an overview visualization using the VOWL notation (with minor modifications).

## Requirements

LD-VOWL requires [Node.js](https://nodejs.org/) to be built.

## Setup

1. Download and install [Node.js](https://nodejs.org/en/download/).
2. Clone this repository running `git clone https://github.com/VisualDataWeb/LD-VOWL.git`.
3. Run `npm install` in the root directory of LD-VOWL to install the dependencies.
4. Run `npm run-script start` to start a local webpack development server on port 8080 or run `npm run-script deploy` for a production build.

## Tests

In order to run the unit tests, run `npm run-script test`.

## License

LD-VOWL is licensed under the MIT License. See LICENSE.txt for more details.

## Demo

A public demo is available at [http://ldvowl.visualdataweb.org/](http://ldvowl.visualdataweb.org).
