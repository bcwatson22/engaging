const client = async (query: string) => {
  try {
    if (!query) {
      return;
    }
    const headers = {
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
    };
    const requestBody = {
      query,
      // variables: { email },
    };
    const options = {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    };
    const response = await (
      await fetch(process.env.HYGRAPH_ENDPOINT!, options)
    ).json();
    return response;
  } catch (err) {
    console.log("ERROR DURING FETCH REQUEST", err);
  }
};
