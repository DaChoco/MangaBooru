
import {jwtDecode} from "jwt-decode"
export function handleJWT(token) {
    try {

        const { exp } = jwtDecode(token)

        console.log("Decoded token:", jwtDecode(token));
        console.log("exp:", exp);

        if (Date.now() >= exp * 1000) {
            throw new Error("Token expired")
        }
        else {
            const remainder = (exp * 1000) - Date.now()
            console.log((remainder / 1000 / 60) + " minutes")
            return true
        }

    }
    catch (error) {

        localStorage.removeItem("access_token");
        console.warn("Token is invalid or expired: ", error);
        return false;
    }

}