export const analyze = (headers: any, queryParams: any, body: any) => {
  console.log('headers:', JSON.stringify(headers));
  console.log('params:', JSON.stringify(queryParams));
  console.log('body', JSON.stringify(body));
};
