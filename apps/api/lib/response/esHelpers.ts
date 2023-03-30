export function handleResolve(body: any) {
  if (!body.error) {
    console.log('\x1b[32m' + 'Success' + '\x1b[37m');
  } else {
    console.log('\x1b[33m' + 'Failed' + '\x1b[37m');
  }

  return Promise.resolve();
}


export function handleError(err: any) {
  console.error(JSON.stringify(err.body, null, 2));
  return Promise.reject();
}
