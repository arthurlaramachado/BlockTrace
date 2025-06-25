"use client"
import { useParams } from "react-router-dom"
import { Fade } from "@mui/material"
import PassportViewer from "../components/PassportViewer"

const PassportPage = () => {
  const { dpp_id } = useParams()

  return (
    <Fade in timeout={600}>
      <div>
        <PassportViewer dppId={dpp_id} />
      </div>
    </Fade>
  )
}

export default PassportPage
