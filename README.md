# World of Tanks Cup Contestants

A small service returning a list of World of Tanks Cup contestants in ESL cups grouped per team size.

## Requirements

Nodejs 4.4.4+ (LTS)

## Installation

Clone this repository:

``` git clone https://github.com/cinetik/wot_contestants ```

Install dependencies

``` npm install ```

## Usage

Start server with

```node index.js```

Request the api with your browser or any HTTP Client
For the task asked by ESL, use this route.

``` GET localhost:1337/cups/worldoftanks/europe```

will return data with the format

```json
{"<teamSize":
	{"<teamId>": {
			"cupsPlayed": <number of cup played>,
			"bestPosition": <best ranking in cup(s) played,
			"worstPosition": <worstPosition in cup(s) played
		},
		// ... other teams
	}
	// ... other teamSize group
}
```

## Bonus

This has been built generically so you can actually request on other games/zone.

Generic routes available, returning the same result format as above

```
	GET localhost:1337/cups/{gameName}/{zone} // zone must equal {'europe', 'north-america' or 'anz'}
	GET localhost:1337/cups/{gameName}/{zone}/limit/{limit} // limit number of cups
```

### Run in CLI mode

To run the service in CLI, you can call it that way:

``` node index.js cli [game] [zone] [limit] ```

Defaults values are worldoftanks europe 25
