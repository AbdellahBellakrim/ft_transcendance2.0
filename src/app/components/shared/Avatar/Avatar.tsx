import Image from "next/image";
import style from "./Avatar.module.css";

interface AvatarProps {
  avatarSrc : string ,
  avatarToRight : boolean
}

function Avatar({ avatarSrc, avatarToRight }:AvatarProps) {
    const avatarStylingClasses: string = `${style.avatar__style} ${
      avatarToRight ? style.image__switch_order : ""
    } `;
    return (
      <div className={avatarStylingClasses}>
        <Image
          className={`${style.avatar__dimentions} ${style.image__full_circle}`}
          src={avatarSrc}
          alt="user avatar"
          width={100}
          height={1000}
        />
      </div>
    );
  }

export default Avatar;