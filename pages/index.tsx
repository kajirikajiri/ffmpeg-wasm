import * as React from 'react';
import { useEffect, useState, useRef } from 'react'
import {FFmpeg as FFmpegInterface} from '@ffmpeg/ffmpeg'
import Script from 'next/script'
import { Box } from '@mui/system';
import { Button, CircularProgress, Typography } from '@mui/material';

declare var FFmpeg: any;

const timeout = 500
export default function Index() {
  const [supportSharedArrayBuffer, setSupportSharedArrayBuffer] = useState()
  const [gifUrls, setGifUrls]=useState<string[]>([])
  const [ratio, setRatio]=useState(0)
  const [processing, setProcessing] =useState(false)
  const refGifUrls = useRef(gifUrls)
  useEffect(()=>{
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg: FFmpegInterface = createFFmpeg({ log: true });
    ffmpeg.setProgress(({ ratio }) => {
      setRatio(ratio)
    });
    (async()=>{
      await ffmpeg.load();
    })()
    ;const transcode = async (event: any) => {
      event.preventDefault();
      setProcessing(true);
      let files = []
      if (event.type === 'change') {
        files = event.target.files
      } else if (event.type === 'drop') {
        files = event.dataTransfer.files
      } else {
        console.error('想定外のeventです')
      }
      const { name } = files[0];
      ffmpeg.FS('writeFile', name, await fetchFile(files[0]));
      // 1 to 30
      await ffmpeg.run( '-i', name, '-r', `15`, '-vf', 'fade=t=in:st=0:d=0.05', `${name}.gif`);
      const data = ffmpeg.FS('readFile', `${name}.gif`);
      const url= URL.createObjectURL(new Blob([data.buffer], {type: 'image/gif'}))
      // const video:any = document.getElementById('player');
      // video.src = url
      setTimeout(()=>{
        setGifUrls([...refGifUrls.current, url])
      }, timeout)
    }
    document?.getElementById('uploader')?.addEventListener('change', transcode);
    document?.getElementById('dropArea')?.addEventListener('dragover', (e)=>e.preventDefault())
    document?.getElementById('dropArea')?.addEventListener('drop', transcode)
  }, [])
  useEffect(()=>{
    if (ratio === 1) {
      setTimeout(()=>{
        setProcessing(false)
      }, timeout)
    }
  }, [ratio])
  useEffect(()=>{
    refGifUrls.current = gifUrls
  }, [gifUrls])
  const ceiledRatio=()=>{
    const ceiledRatio = Math.ceil(ratio * 100)
    if (ceiledRatio > 100) {
      return 100
    } else {
      return ceiledRatio
    }
  }
  return <div>
    <Box id="dropArea" maxWidth={300}>
      <input type="file" id="uploader" hidden/>
      <Button fullWidth style={{height: 100}} variant="contained" onClick={()=>{document?.getElementById('uploader')?.click()}}>upload</Button>
    </Box>
    <Script strategy="beforeInteractive" src="ffmpeg.js" />
                <Box>
                        {
                          gifUrls.map(u=>{
                            return <Box key={u}>
                              <img id="player" src={u}/>
                              <a href={u} download={`${'download'}.gif`}>Download GIF</a>
                            </Box>
                          })
                        }
                        {
                          processing &&                       <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress variant="determinate" value={ceiledRatio()} />
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
                              {`${ceiledRatio()}%`}
                            </Typography>
                          </Box>
                        </Box>
                        }
                </Box>
    {/* <script src="https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js"/> */}
  </div>
}
