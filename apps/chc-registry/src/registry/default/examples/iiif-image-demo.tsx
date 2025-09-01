import { IIIFImage } from '../blocks/iiif-image/components';

export default function IIFImageDemo() {
  return (
    <div className='w-full h-96'>
      <IIIFImage src='https://iiif.wellcomecollection.org/image/b29346423_0006.jp2/full/full/0/default.jpg' />
    </div>
  );
}
