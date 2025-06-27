"use client"
import { useParams } from "react-router-dom"
import { Fade } from "@mui/material"
import OpenPassportPage from "./OpenPassportPage"

const PassportPage = () => {
  const { dpp_id } = useParams()

  return (
    <Fade in timeout={600}>
      <div>
        <OpenPassportPage dppId={dpp_id} />
      </div>
    </Fade>
  )
}

export default PassportPage
