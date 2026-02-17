import { Carousel } from '@mantine/carousel';
import { Box, Card, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { EmblaCarouselType } from 'embla-carousel';
import { useMemo } from 'react';

type ScoreDragProps = {
    changeScore?: Function;
    maxScore?: number
    height?: number;
    initialSlide: number;
    fontSize?: number;
    player: string;
    setEmbla?: (embla: EmblaCarouselType) => void;
    cardBackgroundColor?: string;
}

const FALLBACK_CAROUSEL_HEIGHT = 400;

function ScoreDrag({ changeScore, player = "", maxScore = 50, height = 700, initialSlide = 0, fontSize = 18, setEmbla, cardBackgroundColor }: ScoreDragProps) {

    const initialSlideScore = useMemo(() => initialSlide, []);
    const { ref: containerRef, height: measuredHeight } = useElementSize();
    const carouselHeight = (measuredHeight && measuredHeight > 0) ? measuredHeight : FALLBACK_CAROUSEL_HEIGHT;
    // Scale number size with card height (fontSize prop: 18 = game score, 8 = match score)
    const numberSizePx = carouselHeight * (fontSize / 40);

    function changeSlice(e: number) {
        !!changeScore && changeScore(e, player)
    }

    return (
        <Box
            ref={containerRef}
            w="100%"
            p={4}
            style={{
                height: `min(${height}px, 45vh)`,
                minHeight: 200,
            }}
        >
            <Carousel
                emblaOptions={{ align: 'end' }}
                initialSlide={initialSlideScore}
                slideGap="md"
                getEmblaApi={!!setEmbla ? setEmbla : () => { }}
                orientation="vertical"
                height={carouselHeight}
                withControls={false}
                onSlideChange={(e: number) => changeSlice(e)}
            >
                {[...Array(maxScore)].map((_, i) => i).map(v => (
                    <Carousel.Slide key={v}>
                        <Box py={4} px={2} h="100%" style={{ boxSizing: 'border-box' }}>
                            <Card shadow="sm" padding="md" radius="md" withBorder style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", ...(cardBackgroundColor && { backgroundColor: cardBackgroundColor }) }}>
                                <Text
                                    fz={`${Math.round(numberSizePx)}px`}
                                    ta="center"
                                    style={{ lineHeight: 1, width: "100%" }}
                                >
                                    {v}
                                </Text>
                            </Card>
                        </Box>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </Box>
    )
}

export default ScoreDrag
