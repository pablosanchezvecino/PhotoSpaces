const saveModel = async (inp) => {
  let user = { name: "john", age: 34 };
  let formData = new FormData();
  let photo = inp.files[0];

  console.log(inp.files);

  formData.append("photo", photo);
  formData.append("user", JSON.stringify(user));

  const ctrl = new AbortController(); // timeout
  setTimeout(() => ctrl.abort(), 5000);

  try {
    let r = await fetch("/upload/image", {
      method: "POST",
      body: formData,
      signal: ctrl.signal,
    });
    console.log("HTTP response code:", r.status);
  } catch (e) {
    console.log("Huston we have problem...:", e);
  }
};
