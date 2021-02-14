@app
begin-app

@http
post /message

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
