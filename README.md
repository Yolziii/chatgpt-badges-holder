![Test Results](https://shields.io/endpoint?url=https%3A%2F%2Fbadges.yolziii.dev%2Fyolziii%2Fchatgpt-badges-holder%2Ftest-results&style=for-the-badge)
![Production build tag](https://shields.io/endpoint?url=https%3A%2F%2Fbadges.yolziii.dev%2Fyolziii%2Fchatgpt-badges-holder%2Flatest-tag&style=for-the-badge)
![Coverage](https://shields.io/endpoint?url=https%3A%2F%2Fbadges.yolziii.dev%2Fyolziii%2Fchatgpt-badges-holder%2Fcoverage&style=for-the-badge)


# Service for holding badges for private repositories using the Shields.io endpoint API

This service was created to hold badges for private repositories using
[shield.io enpoint](https://shields.io/endpoint). It provides a simple REST API
with two endpoints - one for creating and modifying badges, and another for
reading them. It  can be integrated into CI/CD pipelines to manage custom badges
that display important information about repositories.

This project was created in collaboration with ChatGPT 4. It guided me and acted
as an experienced developer and DevOps professional. Its teaching and advising
skills made this project a reality. I spent one working day building and
deploying this app from scratch, without prior familiarity with the AWS
publishing pipeline. I spent one more day working on this documentation, setting
up Nginx, a domain, and generating a badge pipeline for the project itself.

I realize that this code not ideal, especially the actions, but it works
properly. It has been fully tested and covered, and for my specific use case, it
fits perfectly. I am happy with the results and I'm exciting about capabilities
of ChatGPT as a developer assistant.

And yes, if you see badges, they were created using instance of this this
service. If you don't see them... well, ops! It could mean that my domain has
expired or the service instance is down for some other reason. Which means that
the value of this project becomes lower, but still, let me know I will fix it
:-)

I don't really expect that someone will publish such a simple service to their
own cloud instance. However, if such a service exists, here is a useful notes
for you, stranger:

1. The POST endpoint allows you to store a badge:

    ```bash
    curl -X POST "https://<service-url>/<user-name>/<repository>/<badge-name>?secret=<service-secret>" \
    -H "Content-Type: application/json" \
    -d '{"badge": {"schemaVersion": 1, "label": "hello", "message": "sweet world", "color": "orange"}}'
    ```

    - **<user-name>** - A unique user

    - **<repository>** - Name of the user's repository

    - **<badge-name>** - A unique badge name that can be used to load this
      badge.

    - **<service-url>** - The URL where your instance is running.

    - **<service-secret>** - The service's secret key that prevents unauthorized
      users from changing your badges.

2. The GET endpoint returns the stored badge:

    ```bash
    curl -X GET "http:/<service.url>/<user-name>/<repository>/<badge-name>"
    ```

Under the hood, badges are stored in the same S3 bucket used by the service.
When updating the service, your badges should remain safe and unaffected.

The project includes two GitHub Actions workflows located in ./github/workflows:

1. **test.yml** - This workflow runs tests for the project after new code is
   pushed to the repository.

2. **deploy.yml** - This workflow deploys the service to AWS when a new tag is
pushed:

    ```
    git tag -a v.1.0.0 -m "Deploy service"
    git push origin v.1.0.0
    ```

To make these workflows function correctly, you need to provide the following
environment variables for each environment where you plan to use this code:

- **SECRET** - a secret value that you define, to be shared with your CI/CD
  scripts.

- **EB_BUCKET_NAME** -  your AWS application environment's bucket name

- **EB_ENVIRONMENT_NAME** - your AWS application environment's name

- **AWS_ACCESS_KEY_ID** - ID for a user with read and write permissions for your
  S3 bucket

- **AWS_SECRET_ACCESS_KEY** - secret key for this user

These environment variables are usually used in:

1. **Local developer environment**, where these values should be stored in a
   .env file in the project root.

2. **GitHub repository** - values are retrieved from your repository secrets.
   For successful deployment, you should add these additional environment
   variables:

    - **AWS_ACCESS_KEY_ID_DEVOPS** - ID for a user with deployment permissions
      for your application

    - **AWS_SECRET_ACCESS_KEY_DEVOPS** - the corresponding secret key

    - **EB_APP_NAME** - your application name

    - **EB_REGION** - the region where your instance is created

3. **AWS** application environment properties.

