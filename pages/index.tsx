import type { NextPage } from 'next'
import { useEffect } from 'react'
import {FFmpeg as FFmpegInterface} from '@ffmpeg/ffmpeg'
// import Head from 'next/head'

declare var FFmpeg: any;

const Home: NextPage = () => {
  useEffect(()=>{
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg: FFmpegInterface = createFFmpeg({ log: true });
    const transcode = async ({ target: { files } }:any) => {
      const { name } = files[0];
      await ffmpeg.load();
      ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
      await ffmpeg.run('-i', name,  'output.mp4');
      const data = ffmpeg.FS('readFile', 'output.mp4');
      const video:any = document.getElementById('player');
      video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    }
    document?.getElementById('uploader')?.addEventListener('change', transcode);
  }, [])
  return <div>
  <video id="player" controls/>
    <input type="file" id="uploader"/>
    <script src="/ffmpeg.js" />
    {/* <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js"/> */}
  </div>
}

export default Home
