import { Fade } from "@mui/material"
import DppForm from "../components/DppForm"

const DppEditPage = () => {
  return (
    <Fade in timeout={600}>
      <div>
        <DppForm mode="edit" />
      </div>
    </Fade>
  )
}

export default DppEditPage
