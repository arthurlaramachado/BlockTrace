import { Fade } from "@mui/material"
import DppForm from "../components/DppForm"

const DppCreatePage = () => {
  return (
    <Fade in timeout={600}>
      <div>
        <DppForm mode="create" />
      </div>
    </Fade>
  )
}

export default DppCreatePage
