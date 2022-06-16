const PANTRY_ID = "03e72aeb-874d-4b7b-9afc-e5bdb49ef939";

async function getUsers() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  const requestOptions = {
    method: "GET",
    headers,
    redirect: "follow",
  };

  const response = await fetch(
    `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/users`,
    requestOptions
  );
  const data = await response.json();

  return data.usersArr;
}

async function editDocument() {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify();

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(
    `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/users`,
    requestOptions
  );

  return await response.json();
}

export { getUsers, editDocument };
