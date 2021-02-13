@app
begin-app

@http
get  /todos
post /todos
post /todos/delete
post /message

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
