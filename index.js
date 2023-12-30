import express from "express"
import multer from "multer"
import dotenv from "dotenv"
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

dotenv.config()
const app = express()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const accessKey = process.env.AWS_ACCESS_KEY
const secretKey = process.env.AWS_SECRET_KEY
const bucketName = process.env.AWS_BUCKET_NAME
const location = process.env.AWS_LOCATION


const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
    },
    region: location
})

app.post("/api/image", upload.single("file"), async (req, res) => {
    const file = req.file
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: req.file.mimetype
    })
    await s3.send(command)
    const imageUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: bucketName,
            Key: file.originalname
        }),
    )
    res.send(imageUrl)
})

app.listen(5000, () => {
    console.log("Server Listening on 5000")
})