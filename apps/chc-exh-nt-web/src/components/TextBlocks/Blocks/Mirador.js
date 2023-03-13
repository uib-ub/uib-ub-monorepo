import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'
import { Flex, Grid, Skeleton } from '@chakra-ui/react'
import Caption from './shared/Caption'

/* const MiradorWithNoSSR = dynamic(() => import('../../IIIF/MiradorViewer'), {
  ssr: false,
}) */

const ObjectBlock = (props) => {
  return null

  /* if ((!props && !props.item) || props.disabled === true) {
    return null
  }

  console.log(JSON.stringify(props, null, 2))

  const { label, description, item, canvasUrl } = props
  const height = '60vh'

  return (
    <Grid
      ref={ref}
      minH={height}
      maxW={['xl', '4xl', '4xl', '6xl']}
      my={{ base: '6', md: '16', lg: '16', xl: '20' }}
      borderBottom={{ base: 'solid 1px', md: 'none' }}
      borderColor="gray.200"
      gridGap={[2, null, 5, null]}
      gridTemplateAreas={{ base: '"image" "metadata"', xl: '"image metadata"' }}
      gridTemplateColumns={{ base: 'auto', lg: '10fr 3fr' }}
      gridTemplateRows="1fr auto"
      mx="auto"
    >
      {item.manifest && inView && (
        <MiradorWithNoSSR
          gridArea="image"
          variant="basic"
          manifests={[
            {
              manifest: item.manifest,
              ...(canvasUrl && { canvasUrl: canvasUrl }),
            },
          ]}
        />
      )}
      {!item.manifest && <Flex gridArea="image">Mangler manifest</Flex>}
      {!inView && <Skeleton height="60vh" />}

      {inView && <Caption label={label} content={description} sourceItem={item} />}
    </Grid>
  ) */
}

export default ObjectBlock
