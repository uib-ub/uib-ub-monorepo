import { nanoid } from 'nanoid'

const typeMap = {
  "Album": [{
    "id": "https://kulturnav.org/b5de0181-665d-47e2-9c3b-7fd22e7ed490",
    "uuid": "b5de0181-665d-47e2-9c3b-7fd22e7ed490"
  }],
  "Bill": [{
    "id": "https://kulturnav.org/cb1a7327-4b90-46b5-a4b5-9d1273571f82",
    "uuid": "cb1a7327-4b90-46b5-a4b5-9d1273571f82"
  }],
  "Booklet": [{
    "id": "https://kulturnav.org/752a31f3-75a5-4970-b25f-75f57fcbf5a7",
    "uuid": "752a31f3-75a5-4970-b25f-75f57fcbf5a7"
  }],
  "BookOfMinutes": [{
    "id": "https://kulturnav.org/edc7cb23-b303-407a-96e4-28fa96ce4b9a",
    "uuid": "edc7cb23-b303-407a-96e4-28fa96ce4b9a"
  }],
  "Brochure": [{
    "id": "https://kulturnav.org/c4168184-68b4-42bd-8ac5-2c1d42ddc464",
    "uuid": "c4168184-68b4-42bd-8ac5-2c1d42ddc464"
  }],
  "Building": [{
    "id": "https://kulturnav.org/d8ea5441-d110-4f78-9c83-50041f82a9e0",
    "uuid": "d8ea5441-d110-4f78-9c83-50041f82a9e0"
  }],
  "Cantata": [{
    "id": "https://kulturnav.org/918ab749-c725-4414-a76c-089e1455b9e4",
    "uuid": "918ab749-c725-4414-a76c-089e1455b9e4"
  }],
  "CashBook": [{
    "id": "https://kulturnav.org/ec4f137f-0829-4f41-a5d6-1ec1682951d9",
    "uuid": "ec4f137f-0829-4f41-a5d6-1ec1682951d9"
  }],
  "CatalogoueCard": [{
    "id": "https://kulturnav.org/a3180707-1fb2-478c-921a-46905353807e",
    "uuid": "a3180707-1fb2-478c-921a-46905353807e"
  }],
  "CatalogueCard": [{
    "id": "https://kulturnav.org/a3180707-1fb2-478c-921a-46905353807e",
    "uuid": "a3180707-1fb2-478c-921a-46905353807e"
  }],
  "Charter": [{
    "id": "https://kulturnav.org/94e0254e-cb7d-45d0-845e-f80e8486ba88",
    "uuid": "94e0254e-cb7d-45d0-845e-f80e8486ba88"
  }],
  "Circulaire": [{
    "id": "https://kulturnav.org/00ebc1d7-1fa9-4d79-9444-699280231dc2",
    "uuid": "00ebc1d7-1fa9-4d79-9444-699280231dc2"
  }],
  "Contract": [{
    "id": "https://kulturnav.org/55d7de86-139c-40f5-bd42-d2ea5b5cde60",
    "uuid": "55d7de86-139c-40f5-bd42-d2ea5b5cde60"
  }],
  "Copy": [{
    "id": "https://kulturnav.org/fd286d8e-3297-453d-9e46-41dccd700063",
    "uuid": "fd286d8e-3297-453d-9e46-41dccd700063"
  }],
  "CopyBook": [{
    "id": "https://kulturnav.org/b5e756a0-74af-4bfa-b9bb-1ca9a8c79344",
    "uuid": "b5e756a0-74af-4bfa-b9bb-1ca9a8c79344"
  }],
  "Deed": [{
    "id": "https://kulturnav.org/d32cc480-4186-4ec8-8d04-f9d2234297e5",
    "uuid": "d32cc480-4186-4ec8-8d04-f9d2234297e5"
  }],
  "Diary": [{
    "id": "https://kulturnav.org/e490b4b1-3ba5-4261-9944-c87db347ba57",
    "uuid": "e490b4b1-3ba5-4261-9944-c87db347ba57"
  }],
  "Drawing": [{
    "id": "https://kulturnav.org/dd910d15-75fd-4920-8f36-1a51693744b8",
    "uuid": "dd910d15-75fd-4920-8f36-1a51693744b8"
  }],
  "ExLibris": [{
    "id": "https://kulturnav.org/20f5cc97-db9d-47c3-8e74-348a2fc6e556",
    "uuid": "20f5cc97-db9d-47c3-8e74-348a2fc6e556"
  }],
  "FinancialStatement": [{
    "id": "https://kulturnav.org/64dfd8d7-8d05-42b1-a54d-43514ee51371",
    "uuid": "64dfd8d7-8d05-42b1-a54d-43514ee51371"
  }],
  "Form": [{
    "id": "https://kulturnav.org/2166909b-b481-4911-9cb7-c8b4300fe321",
    "uuid": "2166909b-b481-4911-9cb7-c8b4300fe321"
  }],
  "Fragment": [{
    "id": "https://kulturnav.org/ea8d7184-81dd-434f-a4f5-af613c2a7892",
    "uuid": "ea8d7184-81dd-434f-a4f5-af613c2a7892"
  }],
  "GraphicArt": [{
    "id": "https://kulturnav.org/7ce56b0c-3aa2-4cf9-b170-30ab87c720e4",
    "uuid": "7ce56b0c-3aa2-4cf9-b170-30ab87c720e4"
  }],
  "JourneyLog": [{
    "id": "https://kulturnav.org/3c5d4eb4-4160-4bee-92c9-cd203e002fd7",
    "uuid": "3c5d4eb4-4160-4bee-92c9-cd203e002fd7"
  }],
  "LandSurvey": [{
    "id": "https://kulturnav.org/e0e15632-6129-49b1-9144-7f4707d2033e",
    "uuid": "e0e15632-6129-49b1-9144-7f4707d2033e"
  }],
  "Monument": [{
    "id": "https://kulturnav.org/d9c2bd10-0d04-4cb4-af7d-397f3a0b8ad8",
    "uuid": "d9c2bd10-0d04-4cb4-af7d-397f3a0b8ad8"
  }],
  "Painting": [{
    "id": "https://kulturnav.org/f6798689-dd33-41be-9e69-d5fd4eaa9e0c",
    "uuid": "f6798689-dd33-41be-9e69-d5fd4eaa9e0c"
  }],
  "Passport": [{
    "id": "https://kulturnav.org/0c31998c-ba2a-491e-8ee3-e2a539cb304b",
    "uuid": "0c31998c-ba2a-491e-8ee3-e2a539cb304b"
  }],
  "Photograph": [{
    "id": "https://kulturnav.org/dd730dd9-8610-4ce1-bfd5-4d5b4f29765b",
    "uuid": "dd730dd9-8610-4ce1-bfd5-4d5b4f29765b"
  }],
  "bilder": [{
    "id": "https://kulturnav.org/74df731d-6921-4b4a-82ca-9720cc0a9f75",
    "uuid": "74df731d-6921-4b4a-82ca-9720cc0a9f75"
  }],
  "Postcard": [{
    "id": "https://kulturnav.org/2e16d4c2-a536-4d47-800b-920c2106c58a",
    "uuid": "2e16d4c2-a536-4d47-800b-920c2106c58a"
  }],
  "Poster": [{
    "id": "https://kulturnav.org/e48030f6-8ebc-4565-a6cb-394a94ebcc0d",
    "uuid": "e48030f6-8ebc-4565-a6cb-394a94ebcc0d"
  }],
  "PrayerBook": [{
    "id": "https://kulturnav.org/849f2036-4b64-465e-9fc6-4a7d5bee89aa",
    "uuid": "849f2036-4b64-465e-9fc6-4a7d5bee89aa"
  }],
  "Protocol": [{
    "id": "https://kulturnav.org/2019829e-ffbe-4f00-b5ff-b573ffe06862",
    "uuid": "2019829e-ffbe-4f00-b5ff-b573ffe06862"
  }],
  "Receipt": [{
    "id": "https://kulturnav.org/2e1d0bfe-3d9d-470e-a468-64372d430ac6",
    "uuid": "2e1d0bfe-3d9d-470e-a468-64372d430ac6"
  }],
  "SaleDeed": [{
    "id": "https://kulturnav.org/4eaf0247-8a95-46d1-8618-6dfc2800405f",
    "uuid": "4eaf0247-8a95-46d1-8618-6dfc2800405f"
  }],
  "Seal": [{
    "id": "https://kulturnav.org/23fd3422-9f2e-41ad-bb7d-486463ca64f0",
    "uuid": "23fd3422-9f2e-41ad-bb7d-486463ca64f0"
  }],
  "Ship": [{
    "id": "https://kulturnav.org/4fa83932-29a2-492a-9737-e9b9a2d23c22",
    "uuid": "4fa83932-29a2-492a-9737-e9b9a2d23c22"
  }],
  "Sigil": [{
    "id": "https://kulturnav.org/23fd3422-9f2e-41ad-bb7d-486463ca64f0",
    "uuid": "23fd3422-9f2e-41ad-bb7d-486463ca64f0"
  }],
  "Speech": [{
    "id": "https://kulturnav.org/22e38c3d-317e-4a3a-b857-e8046a129bcb",
    "uuid": "22e38c3d-317e-4a3a-b857-e8046a129bcb"
  }],
  "Supplication": [{
    "id": "https://kulturnav.org/63f640e3-6e15-4318-b49a-57f7310faeb2",
    "uuid": "63f640e3-6e15-4318-b49a-57f7310faeb2"
  }],
  "Telegram": [{
    "id": "https://kulturnav.org/3ab423e8-9a45-4e52-9b5a-8d2315f0be1d",
    "uuid": "3ab423e8-9a45-4e52-9b5a-8d2315f0be1d"
  }],
  "Ticket": [{
    "id": "https://kulturnav.org/ca039f36-77bd-43fa-8e88-6a7beddb0ecb",
    "uuid": "ca039f36-77bd-43fa-8e88-6a7beddb0ecb"
  }],
  "Transcription": [{
    "id": "https://kulturnav.org/379c8162-ece7-4820-9d0d-1455e69bc6cb",
    "uuid": "379c8162-ece7-4820-9d0d-1455e69bc6cb"
  }],
  "Translation": [{
    "id": "https://kulturnav.org/b6a3f272-8713-4da3-97f8-9e57d00ffd5b",
    "uuid": "b6a3f272-8713-4da3-97f8-9e57d00ffd5b"
  }],
  "Vessel": [{
    "id": "https://kulturnav.org/3983b0bb-2a7c-4917-a19d-aa241348ee33",
    "uuid": "3983b0bb-2a7c-4917-a19d-aa241348ee33"
  }],
  "Article": [{
    "id": "https://kulturnav.org/e9a13b72-b0a9-426a-8161-7bce251ac022",
    "uuid": "e9a13b72-b0a9-426a-8161-7bce251ac022"
  }],
  "Book": [{
    "id": "https://kulturnav.org/02383be8-db2e-4f7b-a6b5-a4288b1c3aa0",
    "uuid": "02383be8-db2e-4f7b-a6b5-a4288b1c3aa0"
  }],
  "bøker": [{
    "id": "https://kulturnav.org/02383be8-db2e-4f7b-a6b5-a4288b1c3aa0",
    "uuid": "02383be8-db2e-4f7b-a6b5-a4288b1c3aa0"
  }],
  "Document": [{
    "id": "https://kulturnav.org/f2a18544-c7aa-4b75-ae0b-c42e3eb043bb",
    "uuid": "f2a18544-c7aa-4b75-ae0b-c42e3eb043bb"
  }],
  "Issue": [{
    "id": "https://kulturnav.org/60fdea04-48d0-485c-8c1c-3479dddeab7c",
    "uuid": "60fdea04-48d0-485c-8c1c-3479dddeab7c"
  }],
  "Journal": [{
    "id": "https://kulturnav.org/887171cf-5b75-4b08-87ab-1f7a8e8f7c84",
    "uuid": "887171cf-5b75-4b08-87ab-1f7a8e8f7c84"
  }],
  "Letter": [{
    "id": "https://kulturnav.org/160dc20f-07f8-4ee8-9f41-73f2bd12a7f9",
    "uuid": "160dc20f-07f8-4ee8-9f41-73f2bd12a7f9"
  }],
  "Magazine": [{
    "id": "https://kulturnav.org/158e58ac-c8f8-4a54-bd06-3ff2105c153e",
    "uuid": "158e58ac-c8f8-4a54-bd06-3ff2105c153e"
  }],
  "Manuscript": [{
    "id": "https://kulturnav.org/b5e756a0-74af-4bfa-b9bb-1ca9a8c79344",
    "uuid": "b5e756a0-74af-4bfa-b9bb-1ca9a8c79344"
  }],
  "privatarkivmateriale": [{
    "id": "https://kulturnav.org/b5e756a0-74af-4bfa-b9bb-1ca9a8c79344",
    "uuid": "b5e756a0-74af-4bfa-b9bb-1ca9a8c79344"
  }],
  "Map": [{
    "id": "https://kulturnav.org/6015872c-e8fc-4518-bcc9-b8972626a465",
    "uuid": "6015872c-e8fc-4518-bcc9-b8972626a465"
  }],
  "Newspaper": [{
    "id": "https://kulturnav.org/a8384b2e-71f0-4e23-b4c3-7809d344bdae",
    "uuid": "a8384b2e-71f0-4e23-b4c3-7809d344bdae"
  }],
  "Note": [{
    "id": "https://kulturnav.org/64304a94-4e5b-448f-a0da-2c82ad57ac61",
    "uuid": "64304a94-4e5b-448f-a0da-2c82ad57ac61"
  }],
  "Person": [{
    "id": "https://kulturnav.org/9d136fdb-13ee-4187-a75f-d46450b1b078",
    "uuid": "9d136fdb-13ee-4187-a75f-d46450b1b078"
  }],
  "Organisasjon": [
    {
      "id": "https://kulturnav.org/869247d2-5167-434e-8b43-305b8c1cc877",
      "uuid": "869247d2-5167-434e-8b43-305b8c1cc877"
    },
    {
      "id": "https://kulturnav.org/a6b5c4fd-e6cd-45f3-a5e8-205e02420e27",
      "uuid": "a6b5c4fd-e6cd-45f3-a5e8-205e02420e27"
    }
  ]
}

export const mapTypes = (types) => {
  console.log(types)
  if (!types) return undefined
  const filteredTypes = types.filter(type => type != 'HumanMadeObject')

  if (Array.isArray(filteredTypes)) {
    return filteredTypes.map((type) => {
      if (typeMap.hasOwnProperty(type)) {
        return typeMap[type].map(type => {
          return {
            _ref: type.uuid,
            _type: 'reference',
            _key: nanoid(),
          }
        })
      }
      return undefined
    })[0]
  }

  if (typeMap.hasOwnProperty(filteredTypes)) {
    return typeMap[filteredTypes].map(type => {
      return {
        _ref: type.uuid,
        _type: 'reference',
        _key: nanoid(),
      }
    })
  }


  return undefined
}