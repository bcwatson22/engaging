import { gql } from "urql";

import {
  personalLogoDimensions,
  companyLogoDimensions,
} from "@/constants/dimensions";

import { multiplyToString } from "@/utils/multiplyToString";

const personalLogoWidth = multiplyToString(personalLogoDimensions.width);
const companyLogoWidth = multiplyToString(companyLogoDimensions.width);

export const queryCV = gql`
  query CV {
    cvs(first: 1) {
      id
      meta {
        id
        title
        description
        keywords
        cookie
      }
      logoLightBackground {
        id
        url(
          transformation: {
            image: { resize: { width: ${personalLogoWidth}, fit: scale } }
            document: { output: { format: webp } }
          }
        )
      }
      logoDarkBackground {
        id
        url(
          transformation: {
            image: { resize: { width: ${personalLogoWidth}, fit: scale } }
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
              image: { resize: { width: ${companyLogoWidth}, fit: scale } }
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
