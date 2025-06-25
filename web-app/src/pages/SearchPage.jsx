import { Fade } from "@mui/material"
import SearchBar from "../components/SearchBar"

const SearchPage = () => {
  return (
    <Fade in timeout={600}>
      <div>
        <SearchBar />
      </div>
    </Fade>
  )
}

export default SearchPage
