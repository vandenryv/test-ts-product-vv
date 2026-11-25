# Products API collection

Open this directory as a Bruno collection. Requests target the development server
at `http://localhost:3000`; change the URL if the server runs elsewhere. Replace
`123` in the individual-resource requests with an ID from your database.

The list requests illustrate the required positive integer `page` and `size`
parameters. Currently, the server validates these as numbers without converting
HTTP query strings, so these requests return HTTP 400 until that is addressed.