# Spec

## Routes

|Method|Path|Body|Success Response|Error|
|---|---|---|---|---|
|GET|`/api/v1/services/:serviceId/reviews`||`200` reviews|`404` service not found|
|POST|`/api/v1/services/:serviceId/reviews`|`{`<br>`authorName: string,`<br>`rating: number,`<br>`comment?: string`<br>`}`|`201` one review, server set `id` and `serverId`|`400` missing fields;<br>`400` `rating` must in range 1 to 5;<br>`404` unknow service|
|GET|`/api/v1/reviews/:id`||`200` one review|`404` review not found|
|PUT|`/api/v1/reviews/:id`|`{`<br>`authorName: string,`<br>`rating: number,`<br>`comment?: string`<br>`}`|`200` one review, replaces `authorName`, `rating`, `comment`|`400` missing fields;<br>`400` `rating` must in range 1 to 5;<br>`404` unknow review|
|PATCH|`/api/v1/reviews/:id`|`{`<br>`authorName?: string,`<br>`rating?: number,`<br>`comment?: string`<br>`}`|`200` one review, replaces only the fields sent|`400` empty body;<br>`400` rating must in range 1 to 5;<br>`404` unknow review|
|DELETE|`/api/v1/reviews/:id`||`204` no body|`404` unknow review|

## Part A Answers

Creating a review with POST is not idempotent, and listing reviews with GET is because each POST create new data, every request make change, while each GET only read data, not make any changes, every request is the same.

## Try the API

```bash
curl --request GET \
    --url http://localhost:3000/api/v1/services/svc_001/reviews

curl --request POST \
    --url http://localhost:3000/api/v1/services/svc_001/reviews \
    --header 'Content-Type: application/json' \
    --data '{
    "authorName": "Tuan",
    "rating": 3,
    "comment": "good"
}'

curl --request GET \
    --url http://localhost:3000/api/v1/reviews/rvw_001

curl --request GET \
    --url http://localhost:3000/api/v1/reviews/rvw_100

curl --request PUT \
    --url http://localhost:3000/api/v1/reviews/rvw_001 \
    --header 'Content-Type: application/json' \
    --data '{
    "authorName": "Nguyen Van A",
    "rating": 1,
    "comment": "bad"
}'

curl --request PATCH \
    --url http://localhost:3000/api/v1/reviews/rvw_001 \
    --header 'Content-Type: application/json' \
    --data '{
    "rating": 5,
    "comment": "great"
}'

curl --request DELETE \
    --url http://localhost:3000/api/v1/reviews/rvw_001
```

## Part C Answers

1. Review list live at `/services/:serviceId/reviews`, because review depend on which service it belong to, while one review live at `/reviews/:id`, because it get a specific review by `ID`.
2. Status `201` for a successful create, `400` for a missing `rating` and `404` for a service that does not exist.
3. Before this API runs for real users, i would add keep data after the process stops, check who sent the review.