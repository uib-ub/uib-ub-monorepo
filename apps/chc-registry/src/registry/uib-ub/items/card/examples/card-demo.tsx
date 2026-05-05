import { ArrowRightIcon } from 'lucide-react';
import { Button } from '../../button/components/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/card';
import Image from 'next/image';

export default function ButtonDemo() {
  return (
    <div className='flex flex-row flex-wrap justify-center items-center gap-5 m-5 w-full not-prose'>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button size="sm">
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          </p>
          <p>
            Cicero ipsum dolores.
          </p>
        </CardContent>
        <CardFooter className="flex-row gap-5">
          <Button>
            Read more
          </Button>
          <Button variant="secondary">
            Read more
          </Button>
        </CardFooter>
      </Card>

      <Card link="https://www.uib.no" className="w-full max-w-sm">
        <Image
          src="https://data.ub.uib.no/files/bs/ubb/ubb-bs/ubb-bs-ok/ubb-bs-ok-09448/jpg/ubb-bs-ok-09448_md.jpg"
          alt="Card Image"
          width={150}
          height={150}
          className="w-full h-full object-cover px-6 pb-2"
        />
        <CardHeader>
          <CardTitle>Herbrand Lavik</CardTitle>
        </CardHeader>
        <CardContent>
          Norsk forfatter og skribent (1901–1965). Han arbeidet som teaterkritiker i Bergens Tidende.
          <ArrowRightIcon className="size-6 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}