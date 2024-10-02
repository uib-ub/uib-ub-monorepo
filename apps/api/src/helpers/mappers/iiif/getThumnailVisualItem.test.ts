import { getThumbnailVisualItem } from './getThumbnailVisualItem';

describe('getThumbnailVisualItem', () => {
  it('should return the ID of the thumbnail visual item if found', () => {
    const data = {
      representation: [
        {
          digitally_shown_by: [
            {
              classified_as: [
                {
                  _label: 'Thumbnails',
                },
              ],
              access_point: [
                {
                  id: 'thumbnail_id',
                },
              ],
            },
          ],
        },
      ],
    };
    expect(getThumbnailVisualItem(data)).toBe('thumbnail_id');
  });

  it('should return null if the thumbnail visual item is not found', () => {
    const data = {
      representation: [
        {
          digitally_shown_by: [
            {
              classified_as: [
                {
                  _label: 'Other',
                },
              ],
              access_point: [
                {
                  id: 'thumbnail_id',
                },
              ],
            },
          ],
        },
      ],
    };
    expect(getThumbnailVisualItem(data)).toBeNull();
  });

  it('should return null if the digital object has no access point', () => {
    const data = {
      representation: [
        {
          digitally_shown_by: [
            {
              classified_as: [
                {
                  _label: 'Thumbnails',
                },
              ],
            },
          ],
        },
      ],
    };
    expect(getThumbnailVisualItem(data)).toBeNull();
  });

  it('should return null if the data is empty', () => {
    const data = {};
    expect(getThumbnailVisualItem(data)).toBeNull();
  });
});