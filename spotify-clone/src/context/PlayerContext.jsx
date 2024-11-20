import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const audioRef = useRef(null);
    const seekBg = useRef(null);
    const seekBar = useRef(null);
    const url = 'http://localhost:4000';

    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const play = () => {
        audioRef.current?.play();
        setPlayStatus(true);
    };

    const pause = () => {
        audioRef.current?.pause();
        setPlayStatus(false);
    };

    const playWithId = async (id) => {
        const selectedTrack = songsData.find((item) => item._id === id);
        if (selectedTrack) {
            setTrack(selectedTrack);
            await audioRef.current?.play();
            setPlayStatus(true);
        }
    };

    const previous = async () => {
        const currentIndex = songsData.findIndex((item) => item._id === track?._id);
        if (currentIndex > 0) {
            setTrack(songsData[currentIndex - 1]);
            await audioRef.current?.play();
            setPlayStatus(true);
        }
    };

    const next = async () => {
        const currentIndex = songsData.findIndex((item) => item._id === track?._id);
        if (currentIndex < songsData.length - 1) {
            setTrack(songsData[currentIndex + 1]);
            await audioRef.current?.play();
            setPlayStatus(true);
        }
    };

    const seekSong = (e) => {
        if (audioRef.current && seekBg.current) {
            const seekPosition = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration;
            audioRef.current.currentTime = seekPosition;
        }
    };

    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            setSongsData(response.data.songs);
            setTrack(response.data.songs[0]);
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    };

    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums);
        } catch (error) {
            console.error("Error fetching albums:", error);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.ontimeupdate = () => {
                if (audioRef.current.duration) {
                    seekBar.current.style.width = `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`;
                    setTime({
                        currentTime: {
                            second: Math.floor(audioRef.current.currentTime % 60),
                            minute: Math.floor(audioRef.current.currentTime / 60),
                        },
                        totalTime: {
                            second: Math.floor(audioRef.current.duration % 60),
                            minute: Math.floor(audioRef.current.duration / 60),
                        },
                    });
                }
            };
        }
    }, [track]);

    useEffect(() => { 
        getSongsData();
        getAlbumsData();
    }, []);

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong,
        songsData, albumsData
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
