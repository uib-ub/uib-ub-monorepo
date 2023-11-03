import { Button, ButtonProps } from './ui/button';
import Link from 'next/link';



export const EditIntentButton = (props: ButtonProps) => {
  const { id } = props;
  return (
    <Button {...props} asChild>
      <Link href={`/studio/desk/intent/edit/id=${id}`} target={'_blank'} rel={'noreferrer'}>
        Redigér
      </Link>
    </Button>
  );
};
