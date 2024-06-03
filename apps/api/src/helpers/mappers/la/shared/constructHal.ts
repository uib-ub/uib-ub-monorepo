export const constructHal = (data: any) => {
  return {
    ...data,
    _links: {
      self: {
        href: data.id
      },
      curies: [
        {
          name: "la",
          href: "https://linked.art/api/rels/1/{rel}",
          templated: true
        }
      ],
    }
  };
};
