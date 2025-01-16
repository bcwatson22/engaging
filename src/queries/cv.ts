import { gql } from "urql";

export const queryCV = gql`
  query CV {
    cvs(first: 1) {
      id
      title
      description
      keywords
      logoLightBackground {
        id
        url
      }
      logoDarkBackground {
        id
        url
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
          url
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
