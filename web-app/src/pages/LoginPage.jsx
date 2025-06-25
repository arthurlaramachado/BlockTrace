import { Fade } from "@mui/material"
import KeyLoginForm from "../components/KeyLoginForm"

const LoginPage = () => {
  return (
    <Fade in timeout={600}>
      <div>
        <KeyLoginForm />
      </div>
    </Fade>
  )
}

export default LoginPage
