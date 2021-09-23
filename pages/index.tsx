import * as React from 'react';
import { useEffect, useState } from 'react'
import {FFmpeg as FFmpegInterface} from '@ffmpeg/ffmpeg'
import Script from 'next/script'
import { Box } from '@mui/system';
import { CircularProgress, Typography } from '@mui/material';

declare var FFmpeg: any;

export default function Index() {
  const [supportSharedArrayBuffer, setSupportSharedArrayBuffer] = useState()
  const [gifUrl, setGifUrl]=useState('')
  const [ratio, setRatio]=useState(-1)
  const [aFlag, setAFlag]=useState(false)
  const [time,setTime]=useState(-1)
  const [bFlag, setBflag]=useState(false)
  // 1. 0.1, 0.2, 0.3, 0.4というふうに0.1秒ごとに加算
  // 2. 実際のratioが0スタート1終わり。
  // 1と2で小さい方の値を正とする
  // useEffect(()=>{
  //   setRatio(ratio)
  //   if (ratio < 0 && time < 0) {
  //     setTime(0)
  //     const intervalId = setInterval(()=>{
  //       if (time >= 1) {
  //         clearInterval(intervalId);
  //         setTime(-1)
  //       } else {
  //         setTime(time + 0.1)
  //       }
  //     }, 100)
  //     // 0.1秒ごとに0.1を加算することをスタート
  //     // これが1になる || ratioが1になる
  //     // によって、loadingを完了とする
  //     // 完了した場合はratioを-1にする
  //   }
  //   if (ratio < 0) {
  //     setRatio(0)
  //     // 処理開始
  //   } else if (ratio === 1) {
  //     setRatio(-1)
  //     // 完了した
  //     // 0にする
  //   } else if (ratio > 1) {
  //     // 何もしない
  //     // たまに1を超えていたのを見たので
  //   } else {
  //     // 0 ~ 0.99
  //     // 最低でも1秒はここにいる
  //     // 1秒の計算スタート
  //   }
  // }, [ratio])
  useEffect(()=>{
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg: FFmpegInterface = createFFmpeg({ log: true });
    ffmpeg.setProgress(({ ratio }) => {
      setRatio(ratio)
    });
    const transcode = async ({ target: { files } }:any) => {
      const { name } = files[0];
      await ffmpeg.load();
      ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
      // 1 to 30
      await ffmpeg.run( '-i', name, '-r', `15`, '-vf', 'fade=t=in:st=0:d=0.05', 'output.gif');
      const data = ffmpeg.FS('readFile', 'output.gif');
      const url= URL.createObjectURL(new Blob([data.buffer], {type: 'image/gif'}))
      const video:any = document.getElementById('player');
      video.src = url
      setGifUrl(url)
    }
    document?.getElementById('uploader')?.addEventListener('change', transcode);
  }, [])
  // const progressValue=()=>{
  //   console.log(ratio, time)
  //   if (ratio > time) {
  //     return time
  //   } else if (time > ratio) {
  //     return ratio
  //   } else {
  //     return ratio
  //   }
  // }
  return <div>
    {/* <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={progressValue()} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${progressValue() * 100}%`}
        </Typography>
      </Box>
    </Box> */}
    <input type="file" id="uploader"/>
    <Script strategy="beforeInteractive" src="ffmpeg.js" />
                <section>
                  <img id="player"/>
                  {gifUrl !== '' && <a href={gifUrl} download={`${'download'}.gif`}>Download GIF</a>}
                </section>
    {/* <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js"/> */}
  </div>
}
