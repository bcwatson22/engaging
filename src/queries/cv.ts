import { gql } from "urql";

import { imageWidth as singleDensityImageSize } from "@/components/atoms/Logo/Logo";
import { logoSize as singleDensityLogoSize } from "@/components/molecules/Company/Company";

import { multiplyToString } from "@/utils/multiplyToString";

const imageSize = multiplyToString(singleDensityImageSize);
const logoSize = multiplyToString(singleDensityLogoSize);

export const queryCV = gql`
  query CV {
    cvs(first: 1) {
      id
      title
      description
      keywords
      logoLightBackground {
        id
        url(
          transformation: {
            image: { resize: { width: ${imageSize}, fit: scale } }
            document: { output: { format: webp } }
          }
        )
      }
      logoDarkBackground {
        id
        url(
          transformation: {
            image: { resize: { width: ${imageSize}, fit: scale } }
            document: { output: { format: webp } }
          }
        )
      }
      intro
      address {
        id
        streetAddress
        locality
        countryName
        postalCode
      }
      contactLinks {
        id
        text
        target
        icon
      }
      gigs {
        id
        company
        logo {
          id
          url(
            transformation: {
              image: { resize: { width: ${logoSize}, fit: scale } }
              document: { output: { format: webp } }
            }
          )
        }
        city
        roles {
          id
          role
          dates
          capacity
          bullets
        }
      }
      skills
      qualifications {
        id
        institution
        location
        dates
        description
      }
      onlineLinks {
        id
        text
        target
        icon
      }
      references {
        id
        person
        role
        company
        link {
          id
          text
          target
          icon
        }
      }
    }
  }
`;
