import { gql } from "urql";

export const queryHome = gql`
  query Home {
    homes(first: 1) {
      id
      title
      description
      mugshot {
        id
        image {
          id
          url
        }
        heading
        description
        links {
          id
          text
          target
          icon
        }
      }
      technologies(first: 12) {
        id
        name
        link {
          id
        }
        icon {
          id
          url
        }
      }
    }
  }
`;
