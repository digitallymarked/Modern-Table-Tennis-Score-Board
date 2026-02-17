import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Container, Grid, Text, Badge, Radio, Group, Space, ActionIcon, Tooltip, Menu, rem, TextInput, Stack, Box, Switch } from "@mantine/core"
import ScoreDrag from "./ScoreDrag"
import { EmblaCarouselType } from "embla-carousel";
import { useLocalStorage } from '@mantine/hooks';
import { useStopwatch } from 'react-timer-hook';

import { IconArrowsExchange, IconArrowsExchange2, IconBounceLeft, IconBounceRight, IconCategory, IconChevronDown, IconChevronUp, IconEye, IconEyeOff, IconMaximize, IconMinimize, IconPingPong, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerTrackNextFilled, IconRepeat, IconServerCog, IconShare, IconSwords, IconZoomReset } from "@tabler/icons-react";
import { determineWhoServe, determineWhoWin } from "../utils/tableTennisUtils";
import { ScoreObject } from "../interface/tableTennisInterface";
import ColorToggleBtn from "./common/ColorToggleBtn";
import superjson from 'superjson';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
// import OverallTimer from "./OverallTimer";

const playersScoreDefaultValue = {
    leftPlayerScore: 0,
    leftPlayerMatchScore: 0,

    rightPlayerScore: 0,
    rightPlayerMatchScore: 0,

    whoServeFirst: "left" as "left" | "right",

    freeText: "",
    leftPlayerName: "",
    rightPlayerName: "",
}

const LEFT_CARD_BG = "oklch(88.5% 0.062 18.334)";
const RIGHT_CARD_BG = "oklch(88.2% 0.059 254.128)";

interface BigScoreBoardProps {
    showTitle?: boolean,
    uid?: string
    showsColorTheme?: boolean
}

function BigScoreBoard({ showTitle: _showTitle = true, uid = "", showsColorTheme = true }: BigScoreBoardProps) {

    const {
        seconds,
        minutes,
        start,
        isRunning,
        pause,
        reset,
    } = useStopwatch({ autoStart: true });

    const navigate = useNavigate();

    // embla API useState
    const [emblaLeftScore, setEmblaLeftScore] = useState<EmblaCarouselType | null>(null);
    const [emblaRightScore, setEmblaRightScore] = useState<EmblaCarouselType | null>(null);

    const [emblaLeftMatchScore, setEmblaLeftMatchScore] = useState<EmblaCarouselType | null>(null);
    const [emblaRightMatchScore, setEmblaRightMatchScore] = useState<EmblaCarouselType | null>(null);

    // General score
    const [playersScore, setPlayersScore] = useLocalStorage<ScoreObject>({
        key: uid === "" ? 'players-score2-scheme' : 'players-score2-scheme-' + uid,
        defaultValue: playersScoreDefaultValue,
        serialize: superjson.stringify,
        getInitialValueInEffect: false,
        deserialize: (str) => (str === undefined ? playersScoreDefaultValue : superjson.parse(str)),
    });

    const [isCurrentFirstPlayerServe, setIsCurrentFirstPlayerServe] = useState<boolean>(true);

    const [showTimer, setShowTimer] = useLocalStorage({ key: 'score-board-show-timer', defaultValue: true });
    const [swapOnNextMatch, setSwapOnNextMatch] = useLocalStorage({ key: 'score-board-swap-on-next-match', defaultValue: true });
    const [nameSwapKey, setNameSwapKey] = useState(0);
    const previousWinnerRef = useRef<string>("");

    const [isShaking, setIsShaking] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const nameSwapDuration = 0.3;
    const nameSwapTransition = { duration: nameSwapDuration, ease: [0.4, 0, 0.2, 1] as const };

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => toast.error("Could not exit fullscreen"));
        } else {
            document.documentElement.requestFullscreen().catch(() => toast.error("Could not enter fullscreen"));
        }
    }

    function fireConfetti() {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);

        const defaults = { zIndex: 1000, origin: { y: 0.6, x: 0.5 } };
        confetti({ ...defaults, particleCount: 80, spread: 70, startVelocity: 45 });
        confetti({ ...defaults, particleCount: 50, spread: 100, startVelocity: 35, decay: 0.92, scalar: 0.9 });
    }

    function changeScore(score: number, player: keyof ScoreObject) {
        setPlayersScore(v => {
            const newPlayer: ScoreObject = {
                ...v,
            }

            if (
                player === "leftPlayerScore" ||
                player === "leftPlayerMatchScore" ||
                player === "rightPlayerScore" ||
                player === "rightPlayerMatchScore" 
            ) {
                newPlayer[player] = score;
            }

            return newPlayer
        });
    }

    function determineWhoServeWithScore(playersScore: ScoreObject) {
        const whoServe = determineWhoServe(playersScore);
        setIsCurrentFirstPlayerServe(whoServe === "left");
    }

    function initScoreScreen(newLeftScore: number, newRightScore: number) {
        emblaLeftScore?.scrollTo(newLeftScore, false)
        emblaRightScore?.scrollTo(newRightScore, false)
    }

    function initMatchScoreScreen(newLeftMatchScore: number, newRightMatchScore: number) {
        emblaLeftMatchScore?.scrollTo(newLeftMatchScore, false);
        emblaRightMatchScore?.scrollTo(newRightMatchScore, false);
    }

    const MAX_SCORE = 49; // 0-indexed, 50 slides (0..49)

    function adjustScore(player: "leftPlayerScore" | "rightPlayerScore" | "leftPlayerMatchScore" | "rightPlayerMatchScore", delta: number) {
        if (!playersScore) return;
        const current = playersScore[player];
        const next = Math.max(0, Math.min(MAX_SCORE, current + delta));
        if (next === current) return;
        setPlayersScore(v => ({ ...v, [player]: next }));
        const emblaMap = {
            leftPlayerScore: emblaLeftScore,
            rightPlayerScore: emblaRightScore,
            leftPlayerMatchScore: emblaLeftMatchScore,
            rightPlayerMatchScore: emblaRightMatchScore,
        };
        emblaMap[player]?.scrollTo(next, false);
    }

    function resetMatchScore() {
        setPlayersScore(v => ({
            ...v,
            leftPlayerMatchScore: 0,
            rightPlayerMatchScore: 0,
        }));

        initMatchScoreScreen(0, 0)
        toast.success('Match score resetted');
    }

    function resetGameScore() {
        setPlayersScore(v => ({
            ...v,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
        }));

        toast.success('Game score resetted');
        initScoreScreen(0, 0);
    }

    function resetAllScore() {
        setPlayersScore(v => ({
            ...v,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
            leftPlayerMatchScore: 0,
            rightPlayerMatchScore: 0,
            whoServeFirst: "left",
            freeText: ""
        }));

        toast.success('All score has been resetted');
        initScoreScreen(0, 0)
        initMatchScoreScreen(0, 0);
    }

    function nextMatctStart() {
        const whoWin = determineWhoWin(playersScore!["leftPlayerScore"], playersScore!["rightPlayerScore"]);
        const newLeftMatchScore = swapOnNextMatch
            ? playersScore!["rightPlayerMatchScore"] + (whoWin === "Right Win >" ? 1 : 0)
            : playersScore!["leftPlayerMatchScore"] + (whoWin === "< Left Win" ? 1 : 0);
        const newRightMatchScore = swapOnNextMatch
            ? playersScore!["leftPlayerMatchScore"] + (whoWin === "< Left Win" ? 1 : 0)
            : playersScore!["rightPlayerMatchScore"] + (whoWin === "Right Win >" ? 1 : 0);

        setPlayersScore(v => ({
            ...v,
            leftPlayerScore: 0,
            rightPlayerScore: 0,
            leftPlayerMatchScore: newLeftMatchScore,
            rightPlayerMatchScore: newRightMatchScore,
            ...(swapOnNextMatch && {
                whoServeFirst: v.whoServeFirst === "right" ? "left" : "right",
                leftPlayerName: v.rightPlayerName ?? "",
                rightPlayerName: v.leftPlayerName ?? "",
            }),
        }));
        if (swapOnNextMatch) setNameSwapKey((k) => k + 1);
        reset();
        initMatchScoreScreen(newLeftMatchScore, newRightMatchScore);
        initScoreScreen(0, 0);
    }

    function swapMatchScore() {
        const newLeftMatchScore = playersScore!["rightPlayerMatchScore"]
        const newRightMatchScore = playersScore!["leftPlayerMatchScore"]

        setPlayersScore(v => ({
            ...v,
            leftPlayerMatchScore: newLeftMatchScore,
            rightPlayerMatchScore: newRightMatchScore,
            // whoServeFirst: v.whoServeFirst === "right" ? "left" : "right"
        }));

        toast.success('Match score swapped!');
        initMatchScoreScreen(newLeftMatchScore, newRightMatchScore)
    }

    function swapGameScore() {
        const newLeftScore = playersScore!["rightPlayerScore"]
        const newRightScore = playersScore!["leftPlayerScore"]

        setPlayersScore(v => ({
            ...v,
            leftPlayerScore: newLeftScore,
            rightPlayerScore: newRightScore,
            // whoServeFirst: v.whoServeFirst === "right" ? "left" : "right"
        }));

        toast.success('Game score swapped!');
        initScoreScreen(newLeftScore, newRightScore);
    }

    useEffect(() => {
        determineWhoServeWithScore(playersScore!);

        const whoWon = determineWhoWin(
            playersScore!["leftPlayerScore"],
            playersScore!["rightPlayerScore"]
        );

        if (whoWon !== "") {
            pause();
            if (previousWinnerRef.current === "") {
                previousWinnerRef.current = whoWon;
                fireConfetti();
            }
        } else {
            previousWinnerRef.current = "";
            if (!isRunning) start();
        }
    }, [playersScore]);

    return (
        <>
            <style>{`
                @keyframes winShake {
                    0%, 100% { transform: translate(0, 0); }
                    10%, 30%, 50%, 70%, 90% { transform: translate(-5px, -3px); }
                    20%, 40%, 60%, 80% { transform: translate(5px, 3px); }
                }
            `}</style>
            <Box style={{ animation: isShaking ? 'winShake 0.5s ease-in-out' : undefined, minHeight: '100vh' }}>
            <Container fluid>

                <Group justify="flex-end" mt={12}>
                    <Group>
                        <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                            <ActionIcon variant="light" aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
                                {isFullscreen ? <IconMinimize style={{ width: '70%', height: '70%' }} stroke={1.5} /> : <IconMaximize style={{ width: '70%', height: '70%' }} stroke={1.5} />}
                            </ActionIcon>
                        </Tooltip>
                        <Menu shadow="md" width={320}>
                            <Menu.Target>
                                <Tooltip label="Menu">
                                    <ActionIcon variant="light" aria-label="Menu" >
                                        <IconCategory style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>
                            </Menu.Target>

                            <Menu.Dropdown>

                                <Menu.Label>
                                    Reset
                                </Menu.Label>

                                <Menu.Item
                                    leftSection={<IconZoomReset style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => resetGameScore()}
                                >
                                    Reset Game Score
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconRepeat style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => resetMatchScore()}
                                >
                                    Reset Match Score
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconServerCog style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => resetAllScore()}
                                >
                                    Reset All Score
                                </Menu.Item>

                                <Menu.Label>
                                    Next match
                                </Menu.Label>

                                <Menu.Item
                                    leftSection={<IconPlayerTrackNextFilled style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={(e) => e.stopPropagation()}
                                    closeMenuOnClick={false}
                                >
                                    <Group justify="space-between" wrap="nowrap" gap="sm">
                                        <Text size="sm" style={{ whiteSpace: 'nowrap' }}>Swap sides on next match</Text>
                                        <Switch
                                            checked={swapOnNextMatch}
                                            onChange={(e) => {
                                                setSwapOnNextMatch(e.currentTarget.checked);
                                                toast.success(e.currentTarget.checked ? "Swap sides on next match: on" : "Swap sides on next match: off");
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Group>
                                </Menu.Item>

                                <Menu.Label>
                                    Swap
                                </Menu.Label>

                                <Menu.Item
                                    leftSection={<IconArrowsExchange style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => swapMatchScore()}
                                >
                                    Swap Match Score
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconArrowsExchange2 style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => swapGameScore()}
                                >
                                    Swap Game Score
                                </Menu.Item>

                                <Menu.Label>
                                    Timer
                                </Menu.Label>

                                <Menu.Item
                                    leftSection={<IconPlayerPlayFilled style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        toast.success("Timer Started")
                                        start()
                                    }}
                                >
                                    Start Timer
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconPlayerPauseFilled style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        toast.success("Timer Stopped")
                                        pause()
                                    }}
                                >
                                    Pause Timer
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconRepeat style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        toast.success("Timer Resetted")
                                        reset()
                                    }}
                                >
                                    Reset Timer
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={showTimer ? <IconEyeOff style={{ width: rem(14), height: rem(14) }} /> : <IconEye style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        setShowTimer((v) => !v);
                                        toast.success(showTimer ? "Timer hidden" : "Timer shown");
                                    }}
                                >
                                    {showTimer ? "Hide Timer" : "Show Timer"}
                                </Menu.Item>

                                <Menu.Label>
                                    Mode
                                </Menu.Label>

                                <Menu.Item
                                    leftSection={<IconRepeat style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        navigate("/multi")
                                    }}
                                >
                                    To Multi Mode
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconRepeat style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => {
                                        navigate("/")
                                    }}
                                >
                                    To Basic Mode
                                </Menu.Item>


                                <Menu.Label>
                                    Others
                                </Menu.Label>

                                <Menu.Item
                                    leftSection={<IconShare style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={async () => {
                                        await navigator.share({
                                            title: `TT Match Result (Match: ${playersScore.leftPlayerMatchScore} - ${playersScore.rightPlayerMatchScore}) ` +
                                                `(Score: ${playersScore.leftPlayerScore} - ${playersScore.rightPlayerScore}) `,
                                            text: "*Match Result*\n" +
                                                `${playersScore.leftPlayerMatchScore} - ${playersScore.rightPlayerMatchScore}\n` +
                                                `Curretn Score \n` +
                                                `${playersScore.leftPlayerScore} - ${playersScore.rightPlayerScore}\n`,
                                            url: window.location.href,
                                        });
                                    }}
                                >
                                    Share Result
                                </Menu.Item>

                            </Menu.Dropdown>
                        </Menu>
                        {showsColorTheme && <ColorToggleBtn />}
                    </Group>
                </Group>

                <Group justify="center" mt={16}>
                    <Tooltip label="Start Next Match">
                        <ActionIcon
                            variant="light"
                            aria-label="Start Next Match"
                            onClick={() => nextMatctStart()}
                            disabled={determineWhoWin(playersScore!["leftPlayerScore"], playersScore!["rightPlayerScore"]) === ""}
                        >
                            <IconPlayerTrackNextFilled style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                <Radio.Group
                    mt={16}
                    value={playersScore!.whoServeFirst}
                    onChange={(v: string) => !!playersScore && setPlayersScore({
                        ...playersScore,
                        whoServeFirst: v as "left" | "right"
                    })}
                    withAsterisk
                >
                    <Grid gutter="sm">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Stack gap="xs">
                                <Radio value="left" label={<><IconPingPong size={18} /> First Serve </>} />
                                {swapOnNextMatch ? (
                                    <Box style={{ position: 'relative', overflow: 'hidden', width: '100%', minWidth: 0, minHeight: rem(112) }}>
                                        <AnimatePresence initial={false}>
                                            <motion.div
                                                key={`left-${nameSwapKey}`}
                                                initial={{ y: -20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 20, opacity: 0 }}
                                                transition={nameSwapTransition}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0, top: 0, right: 0, bottom: 0,
                                                    display: 'flex', alignItems: 'center', boxSizing: 'border-box',
                                                }}
                                            >
                                                <TextInput
                                                    placeholder="Left player"
                                                    variant="unstyled"
                                                    value={playersScore?.leftPlayerName ?? ""}
                                                    onChange={(e) => !!playersScore && setPlayersScore({ ...playersScore, leftPlayerName: e.currentTarget.value })}
                                                    size="xl"
                                                    styles={{
                                                        root: { width: '100%' },
                                                        input: {
                                                            fontSize: rem(60),
                                                            minHeight: rem(112),
                                                            border: 'none', outline: 'none', boxShadow: 'none',
                                                            backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0,
                                                        },
                                                    }}
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                    </Box>
                                ) : (
                                    <TextInput
                                        placeholder="Left player"
                                        variant="unstyled"
                                        value={playersScore?.leftPlayerName ?? ""}
                                        onChange={(e) => !!playersScore && setPlayersScore({ ...playersScore, leftPlayerName: e.currentTarget.value })}
                                        size="xl"
                                        styles={{
                                            root: { width: '100%' },
                                            input: {
                                                fontSize: rem(60),
                                                minHeight: rem(112),
                                                border: 'none', outline: 'none', boxShadow: 'none',
                                                backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0,
                                            },
                                        }}
                                    />
                                )}
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Stack gap="xs" align="flex-end">
                                <Radio value="right" label={<><IconPingPong size={18} /> First Serve </>} />
                                {swapOnNextMatch ? (
                                    <Box style={{ position: 'relative', overflow: 'hidden', width: '100%', minWidth: 0, minHeight: rem(112) }}>
                                        <AnimatePresence initial={false}>
                                            <motion.div
                                                key={`right-${nameSwapKey}`}
                                                initial={{ y: -20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 20, opacity: 0 }}
                                                transition={nameSwapTransition}
                                                style={{
                                                    position: 'absolute',
                                                    left: 0, top: 0, right: 0, bottom: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box',
                                                }}
                                            >
                                                <TextInput
                                                    placeholder="Right player"
                                                    variant="unstyled"
                                                    value={playersScore?.rightPlayerName ?? ""}
                                                    onChange={(e) => !!playersScore && setPlayersScore({ ...playersScore, rightPlayerName: e.currentTarget.value })}
                                                    size="xl"
                                                    styles={{
                                                        root: { width: '100%' },
                                                        input: {
                                                            fontSize: rem(60),
                                                            minHeight: rem(112),
                                                            border: 'none', outline: 'none', boxShadow: 'none',
                                                            backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0,
                                                            textAlign: 'right',
                                                        },
                                                    }}
                                                />
                                            </motion.div>
                                        </AnimatePresence>
                                    </Box>
                                ) : (
                                    <TextInput
                                        placeholder="Right player"
                                        variant="unstyled"
                                        value={playersScore?.rightPlayerName ?? ""}
                                        onChange={(e) => !!playersScore && setPlayersScore({ ...playersScore, rightPlayerName: e.currentTarget.value })}
                                        size="xl"
                                        styles={{
                                            root: { width: '100%' },
                                            input: {
                                                fontSize: rem(60),
                                                minHeight: rem(112),
                                                border: 'none', outline: 'none', boxShadow: 'none',
                                                backgroundColor: 'transparent', paddingLeft: 0, paddingRight: 0,
                                                textAlign: 'right',
                                            },
                                        }}
                                    />
                                )}
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Radio.Group>

                <Grid mt={16} align="flex-start">
                    <Grid.Col span={{ base: 6, md: 5, lg: 5 }} order={{ base: 2, md: 1, lg: 1 }}>
                        <Stack align="center" gap="xs">
                            <ActionIcon size="xl" variant="light" color="gray" aria-label="Increase score" onClick={() => adjustScore("leftPlayerScore", 1)}>
                                <IconChevronUp style={{ width: rem(24), height: rem(24) }} stroke={2} />
                            </ActionIcon>
                            <ScoreDrag
                                initialSlide={playersScore!.leftPlayerScore}
                                changeScore={changeScore}
                                player={"leftPlayerScore"}
                                setEmbla={setEmblaLeftScore}
                                height={600}
                                fontSize={18}
                                cardBackgroundColor={LEFT_CARD_BG}
                            />
                            <ActionIcon size="xl" variant="light" color="gray" aria-label="Decrease score" onClick={() => adjustScore("leftPlayerScore", -1)}>
                                <IconChevronDown style={{ width: rem(24), height: rem(24) }} stroke={2} />
                            </ActionIcon>
                        </Stack>
                        {isCurrentFirstPlayerServe
                            && (
                                <Group justify="center" mt="md">
                                    <Badge
                                        color="blue"
                                        size="lg"
                                        tt="none"
                                        style={{
                                            fontSize: rem(28),
                                            padding: `${rem(10)} ${rem(20)}`,
                                            minHeight: rem(52),
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: rem(10),
                                            lineHeight: 1,
                                        }}
                                    >
                                        <IconBounceLeft style={{ width: rem(28), height: rem(28), flexShrink: 0 }} />
                                        Serve
                                    </Badge>
                                </Group>
                            )
                        }
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 2, lg: 2 }} order={{ base: 1, md: 2, lg: 2 }}>
                        <Grid>
                            <Grid.Col span={{ base: 3, md: 6, lg: 6 }} offset={{ base: 3, md: 0, lg: 0 }}>
                                <Stack align="center" gap="xs">
                                    <ActionIcon size="xl" variant="light" color="gray" aria-label="Increase match score" onClick={() => adjustScore("leftPlayerMatchScore", 1)}>
                                        <IconChevronUp style={{ width: rem(24), height: rem(24) }} stroke={2} />
                                    </ActionIcon>
                                    <ScoreDrag
                                        initialSlide={playersScore!.leftPlayerMatchScore}
                                        player={"leftPlayerMatchScore"}
                                        changeScore={changeScore}
                                        height={600}
                                        fontSize={8}
                                        setEmbla={setEmblaLeftMatchScore}
                                        cardBackgroundColor={LEFT_CARD_BG}
                                    />
                                    <ActionIcon size="xl" variant="light" color="gray" aria-label="Decrease match score" onClick={() => adjustScore("leftPlayerMatchScore", -1)}>
                                        <IconChevronDown style={{ width: rem(24), height: rem(24) }} stroke={2} />
                                    </ActionIcon>
                                </Stack>
                            </Grid.Col>

                            <Grid.Col span={{ base: 3, md: 6, lg: 6 }}>
                                <Stack align="center" gap="xs">
                                    <ActionIcon size="xl" variant="light" color="gray" aria-label="Increase match score" onClick={() => adjustScore("rightPlayerMatchScore", 1)}>
                                        <IconChevronUp style={{ width: rem(24), height: rem(24) }} stroke={2} />
                                    </ActionIcon>
                                    <ScoreDrag
                                        initialSlide={playersScore!.rightPlayerMatchScore}
                                        player={"rightPlayerMatchScore"}
                                        changeScore={changeScore}
                                        height={600}
                                        fontSize={8}
                                        setEmbla={setEmblaRightMatchScore}
                                        cardBackgroundColor={RIGHT_CARD_BG}
                                    />
                                    <ActionIcon size="xl" variant="light" color="gray" aria-label="Decrease match score" onClick={() => adjustScore("rightPlayerMatchScore", -1)}>
                                        <IconChevronDown style={{ width: rem(24), height: rem(24) }} stroke={2} />
                                    </ActionIcon>
                                </Stack>
                            </Grid.Col>

                        </Grid>

                        {
                            playersScore!["leftPlayerScore"] >= 10
                            && playersScore!["rightPlayerScore"] >= 10
                            && (<Text ta="center" fz={32} fw={300}> <IconSwords /> Deuce </Text>)
                        }

                        {showTimer && (
                            <Text ta="center" fz={22} c="dimmed" mt={2}>
                                {minutes >= 10 ? minutes : "0" + minutes}:{seconds >= 10 ? seconds : "0" + seconds}
                            </Text>
                        )}

                        <Text ta="center" fz={32} fw={400}>
                            {determineWhoWin(playersScore!["leftPlayerScore"], playersScore!["rightPlayerScore"])}
                        </Text>

                    </Grid.Col>

                    <Grid.Col span={{ base: 6, md: 5, lg: 5 }} order={{ base: 3, md: 3, lg: 3 }}>
                        <Stack align="center" gap="xs">
                            <ActionIcon size="xl" variant="light" color="gray" aria-label="Increase score" onClick={() => adjustScore("rightPlayerScore", 1)}>
                                <IconChevronUp style={{ width: rem(24), height: rem(24) }} stroke={2} />
                            </ActionIcon>
                            <ScoreDrag
                                initialSlide={playersScore!.rightPlayerScore}
                                changeScore={changeScore}
                                player={"rightPlayerScore"}
                                setEmbla={setEmblaRightScore}
                                height={600}
                                fontSize={18}
                                cardBackgroundColor={RIGHT_CARD_BG}
                            />
                            <ActionIcon size="xl" variant="light" color="gray" aria-label="Decrease score" onClick={() => adjustScore("rightPlayerScore", -1)}>
                                <IconChevronDown style={{ width: rem(24), height: rem(24) }} stroke={2} />
                            </ActionIcon>
                        </Stack>
                        {!isCurrentFirstPlayerServe
                            && (
                                <Group justify="center" mt="md">
                                    <Badge
                                        color="blue"
                                        size="lg"
                                        tt="none"
                                        style={{
                                            fontSize: rem(28),
                                            padding: `${rem(10)} ${rem(20)}`,
                                            minHeight: rem(52),
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: rem(10),
                                            lineHeight: 1,
                                        }}
                                    >
                                        <IconBounceRight style={{ width: rem(28), height: rem(28), flexShrink: 0 }} />
                                        Serve
                                    </Badge>
                                </Group>
                            )
                        }
                    </Grid.Col>
                </Grid>
            </Container>

            <Space h="md" />
            </Box>
        </>
    )
}

export default BigScoreBoard
