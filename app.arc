@app
begin-app

@http
post /message
post /clear

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
