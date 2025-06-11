  await fetch("http://localhost:9000/store/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-publishable-api-key": "pk_e677a087b82c8104521e193f53d7f8c34362e61dea419fb1fd16a27ca1e2f1ed" },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Test12345",
      first_name: "Max",
      last_name: "Mustermann"
    }),
  }).then(res => res.json()).then(data => console.log(data));
  