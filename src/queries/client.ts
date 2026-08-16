type TResponse<Data> = {
  data?: Record<string, Data[]>;
  errors?: { message: string }[];
};

/* `no-store` is deliberate. Next's autoNoCache is tripped by an Authorization
   header or a POST whenever the segment's revalidate is 0 — which is the case
   in the dynamic /api/og route. Rather than depend on that resolving
   favourably, caching is left entirely to unstable_cache in getData, which
   caches the result and so is transport- and context-independent. */
const fetchCms = async <Data>(query: string): Promise<TResponse<Data>> => {
  const response = await fetch(process.env.HYGRAPH_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });

  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);

  return await response.json();
};

export { fetchCms };
export type { TResponse };
