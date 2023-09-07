const ip = "10.100.102.9";
const fs = require("fs");
const multer = require("multer");
const express = require("express");
const http = require("http");
const axios = require("axios");
const mysql = require("mysql");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");
const { json } = require("body-parser");
const e = require("express");
const nodemailer = require("nodemailer");

function date_and_time() {
  const current_date = new Date();
  let hours, minutes;
  if (current_date.getHours() < 10) hours = "0" + current_date.getHours();
  else hours = current_date.getHours();

  if (current_date.getMinutes() < 10) minutes = "0" + current_date.getMinutes();
  else minutes = current_date.getMinutes();

  const time = hours + ":" + minutes + ":" + current_date.getSeconds();
  const date =
    current_date.getFullYear() +
    "-" +
    (current_date.getMonth() + 1) +
    "-" +
    current_date.getDate() +
    " " +
    time;
  return [date, time];
}
const sendemail = async (recipent, user_name) => {
  try {
    let txt = `Hello ${user_name}.\n We wanted to congratulate you for joining us and hope you enjoy your stay on the site. `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "web022061@gmail.com",
        pass: "wjbyirivzqyjgpaw",
      },
    });
    const mailOptions = {
      from: "web022061@gmail.com",
      to: recipent,
      subject: "Welcome to PhotoShare",
      text: txt,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("email sent", info.response);
  } catch (error) {
    console.error(error);
  }
};
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Aa1234567",
  database: "tweets",
});
//profile_image
const storage_profile_image = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "profile_image/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload_profile_image = multer({
  storage: storage_profile_image,
});

//posts
const storage_posts = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "posts/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload_posts = multer({ storage: storage_posts });

// stories
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "stories/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
//
const app = express();
app.use(express.json());
app.use(cors());
app.use(
  "/profile_image",
  express.static(path.join(__dirname, "profile_image"))
);
app.use("/stories", express.static(path.join(__dirname, "stories")));
app.use("/posts", express.static(path.join(__dirname, "posts")));
app.post(
  "/upload_profile_image",
  upload_profile_image.single("profile"),
  (req, res) => {
    const image = req.file.path;
    const user_id = req.body.user_id;
    if (!image) {
      return res.status(400).json({ err: "no image provide" });
    }
    const target_path = `profile_image/${user_id}_${req.file.originalname}`;
    fs.rename(image, target_path, (err) => {
      if (err) {
        return res.status(500);
      }
    });
    const imageFilePath = target_path;

    const sql = `UPDATE user SET profile_image='${imageFilePath}' WHERE user_id=${user_id}`;

    db.query(sql, (err, data) => {
      if (err) return res.status(201).json("upload faild");
      return res.status(200).json(imageFilePath);
    });
  }
);

app.post("/upload_story_image", upload.single("story"), (req, res) => {
  const image = req.file.path;
  const user_id = req.body.user_id;
  if (!image) {
    return res.status(400).json({ err: "no image provide" });
  }
  const target_path = `stories/${user_id}_${req.file.originalname}`;
  fs.rename(image, target_path, (err) => {
    if (err) {
      return res.status(500);
    }
  });
  const imageFilePath = target_path;
  const [date, time] = date_and_time();
  const sql = `INSERT INTO story(	post_user_id,image_path,date,time) values (${user_id},'${imageFilePath}','${date}','${time}')`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("upload faild");
    return res.status(200).json(imageFilePath);
  });
});

app.post("/upload_new_post", upload_posts.single("post"), (req, res) => {
  const image = req.file.path;
  const user_id = req.body.user_id;
  if (!image) {
    return res.status(400).json({ err: "no image provide" });
  }
  const target_path = `posts/${user_id}_${req.file.originalname}`;
  fs.rename(image, target_path, (err) => {
    if (err) {
      return res.status(500);
    }
  });
  const imageFilePath = target_path;
  const [date, time] = date_and_time();
  const sql = `INSERT INTO post(post_user_id,image_path,date,time) values (${user_id},'${imageFilePath}','${date}','${time}') `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("upload faild");

    return res.status(200).json(imageFilePath);
  });
});

app.post("/set_likes", (req, res) => {
  const { post_id, is_like, my_user_id } = req.body;
  let sql = "";
  if (is_like)
    sql = `UPDATE post SET likes_numbers=likes_numbers+1, liked_by=CONCAT(liked_by,'${my_user_id},') WHERE post_id=${post_id}`;
  else
    sql = `UPDATE post SET likes_numbers=likes_numbers-1, liked_by=REPLACE(liked_by,',${my_user_id},',',') WHERE post_id=${post_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("set faild");
    res.status(200).json("seccess");
  });
});
app.post("/set_new_post", (req, res) => {
  const { image, short_dis } = req.body;
  const sql = `UPDATE post SET short_dis='${short_dis}', is_posted=1 WHERE image_path='${image}'`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("delete faild");
    res.status(200).json("seccess");
  });
});
app.post("/delete_post", (req, res) => {
  const image_path = req.body.image_path;
  sql = `DELETE FROM post WHERE image_path='${image_path}'`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("delete faild");
    res.status(200).json("seccess");
  });
});

app.post("/set_user_seen_story", (req, res) => {
  const { user_id, story_id } = req.body;

  const seen_by_sql = `SELECT * FROM story WHERE story_id =${story_id} `;

  db.query(seen_by_sql, (err, data) => {
    if (err) return res.status(201).json("upload faild");
    else {
      const seen_by = data[0].seen_by;
      if (seen_by.includes("," + user_id + ","))
        res.status(200).json("success");
      else {
        const update_sql = `UPDATE story SET seen_by='${seen_by}${user_id},' ,seen_by_number=seen_by_number+1 WHERE story_id=${story_id}`;
        db.query(update_sql, (err, data) => {
          if (err) return res.status(201).json("upload faild");
          else {
            res.status(200).json("success");
          }
        });
      }
    }
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `http://${ip}:3000`,
    methods: ["GET", "POST"],
  },
});
app.post("/sign_in", (req, res) => {
  const { username, password, email } = req.body;
  const sql_select_username = `SELECT * FROM user WHERE user_name ='${username}' OR email='${email}'`;
  let alert = "";

  db.query(sql_select_username, (err, data) => {
    if (err) console.log(err);
    else if (data.length > 0) {
      res.status(201).json({ massege: "user name" });
    } else if (data.length === 0) {
      const sql_insert = `INSERT INTO user(user_name,email,password) values ('${username}','${email}','${password}')`;
      db.query(sql_insert, (err, data) => {
        if (err) console.log(err);
        else {
          sendemail(email, username);
          res.status(200).json({ sucsess: true });
        }
      });
    }
  });
});

app.post("/login", (req, res) => {
  const { user_name, password } = req.body;
  const sql = `SELECT * FROM user WHERE user_name ='${user_name}' AND password='${password}'`;

  db.query(sql, (err, data) => {
    if (err || data.length === 0) return res.status(201).json("login faild");
    if (data.length > 0) res.status(200).json(data[0]);
  });
});

app.post("/set_is_connected", (req, res) => {
  const { user_id, is_connected } = req.body;

  const sql = `UPDATE user SET is_connected=${
    is_connected ? 1 : 0
  } WHERE user_id=${user_id}`;
  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("set data failed");
    else {
      if (is_connected) io.emit(`set_user_${user_id}_is_connected`);
      res.status(200).json("");
    }
  });
});

app.post("/set_current_page", (req, res) => {
  const { user_id, current_page } = req.body;
  const sql = `UPDATE user SET current_page='${current_page}' WHERE user_id=${user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("set data faild");
    res.status(200).json("succses");
  });
});

app.post("/set_user_name", (req, res) => {
  const { user_name, user_id } = req.body;
  const sql = `SELECT * FROM user WHERE user_name ='${user_name}'`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("login faild");

    if (data.length > 0)
      return res.status(200).json((alert = "this user name is already exist"));
    else {
      const sql_set = `UPDATE user SET user_name='${user_name}' WHERE user_id=${user_id}`;
      db.query(sql_set, (err, data) => {
        if (err) return res.status(201).json("set name faild");
        return res.status(200).json((alert = "user name is changed"));
      });
    }
  });
});
app.post("/get_searched_users", (req, res) => {
  const { user_name, my_user_id } = req.body;
  const sql = `SELECT u.* ,c.room FROM user u
         LEFT JOIN chat c ON u.user_id=SUBSTRING_INDEX(c.room,'-',1) AND ${my_user_id}=SUBSTRING_INDEX(c.room,'-',-1) OR u.user_id=SUBSTRING_INDEX(c.room,'-',-1) AND ${my_user_id}=SUBSTRING_INDEX(c.room,'-',1)
          WHERE user_name  LIKE '${user_name}%' AND u.user_id !=${my_user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    else res.status(200).json(data);
  });
});
app.post("/get_suggests", (req, res) => {
  const this_user_id = req.body.this_user_id;
  const sql = `SELECT u.* FROM user u
  LEFT JOIN follow_requests f ON f.recived_user=u.user_id AND f.request_user=${this_user_id}
   WHERE u.followers_id NOT LIKE '%,${this_user_id},%' AND NOT u.user_id=${this_user_id} AND   f.req_id is NULL  ORDER BY u.followers DESC
   LIMIT 20 `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    res.status(200).json(data);
  });
});
app.post("/get_userdata", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT * FROM user WHERE user_id =${user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    if (data.length > 0) res.status(200).json(data[0]);
  });
});
app.post("/delete_user", (req, res) => {
  const userdata = req.body.userdata;
  const user_id = userdata.user_id;
  let sql = "";
  sql = `UPDATE user set followers=followers-1,followers_id=REPLACE(followers_id,',${user_id},',','),following=following-1,following_id=REPLACE(following_id,',${user_id},',','),stoke_users=stoke_users-1,stoke_mode=REPLACE(stoke_mode,',${user_id},',',')
 WHERE followers_id LIKE '%,${user_id},%' OR following_id LIKE '%,${user_id},%' OR  stoke_mode LIKE '%,${user_id},%'

 `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("delete faild");
    sql = `SELECT * FROM comment WHERE post_user_id=${user_id} `;
    db.query(sql, (err, comments_data) => {
      if (err) return res.status(201).json("delete faild");
      for (let i = 0; i < comments_data.length; i++) {
        axios
          .post(`http://${ip}:8001/remove_comment`, {
            comment_id: comments_data[i].comment_id,
          })
          .catch((err) => console.log(err));
      }

      sql = `UPDATE post set likes_numbers=likes_numbers-1,liked_by=REPLACE(liked_by,',${user_id},',',') WHERE liked_by LIKE '%,${user_id},%' 

 `;
      db.query(sql, (err, remove_like_data) => {
        if (err) return res.status(201).json("delete faild");
        sql = `DELETE FROM user WHERE user_id=${user_id}`;
        db.query(sql, (err, delete_data) => {
          if (err) return res.status(201).json("delete faild");

          res.status(200).json("success");
        });
      });
    });
  });
});

app.post("/get_stokers", (req, res) => {
  let stokers_id = req.body.stokers_id;
  if (stokers_id !== ",") {
    stokers_id = stokers_id.substring(1, stokers_id.length - 1);
    stokers_id = stokers_id.substring(0, stokers_id.length);
    stokers_id = "(" + stokers_id;
    stokers_id = stokers_id + ")";
    const sql = `SELECT u.user_id,u.user_name,u.profile_image FROM user u WHERE user_id IN ${stokers_id}`;

    db.query(sql, (err, data) => {
      if (err) return res.status(201).json("userdata faild");
      res.status(200).json(data);
    });
  } else {
    res.status(200).json([]);
  }
});
app.post("/set_private_state", (req, res) => {
  const { user_id, is_activate } = req.body;
  const sql = `UPDATE user set is_private=${
    is_activate ? 1 : 0
  } WHERE user_id=${user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("set private faild");
    res.status(200).json("success");
  });
});
app.post("/set_stoke_mode_state", (req, res) => {
  const { my_user_id, other_user_id, is_activate } = req.body;
  const sql = `UPDATE user set stoke_mode=${
    is_activate
      ? `CONCAT(stoke_mode,'${other_user_id},')`
      : `REPLACE(stoke_mode,',${other_user_id},',',')`
  },stoke_users=${
    is_activate ? `stoke_users+1` : `stoke_users-1`
  }   WHERE user_id=${my_user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("set stoke mode faild");
    const sql_delete_alerts = `UPDATE alert set is_stoker_alert=0 WHERE alert_user_id=${other_user_id} AND recived_user=${my_user_id} AND is_stoker_alert=1`;
    db.query(sql_delete_alerts, (err, data) => {
      if (err) return res.status(201).json("set stoke mode faild");
    });
    res.status(200).json("successs");
  });
});
app.post("/get_post_data", (req, res) => {
  const post_id = req.body.post_id;
  const sql = `SELECT p.*,u.profile_image,u.user_name,u.followers_id,u.is_private FROM post p
  JOIN user u ON p.post_user_id=u.user_id
   WHERE post_id =${post_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    res.status(200).json(data[0]);
  });
});

app.post("/get_all_posts", (req, res) => {
  const { user_id, offset } = req.body;
  const sql = `SELECT p.*,u.profile_image,u.user_name FROM post p
  JOIN user u ON p.post_user_id=u.user_id
   WHERE u.followers_id LIKE '%,${user_id},%'
   ORDER BY post_id DESC
   LIMIT 2 OFFSET ${offset}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    res.status(200).json(data);
  });
});
app.post("/get_all_my_posts", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT * FROM post WHERE post_user_id =${user_id} ORDER BY post_id DESC`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    res.status(200).json(data);
  });
});
app.post("/get_all_liked_posts", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT * FROM post WHERE liked_by LIKE '%,${user_id},%' ORDER BY post_id DESC`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    res.status(200).json(data);
  });
});
app.post("/get_comments_number", (req, res) => {
  const post_id = req.body.post_id;
  const sql = `SELECT comments_number FROM post WHERE post_id=${post_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    res.status(200).json(data[0].comments_number);
  });
});

app.post("/get_post_comments", (req, res) => {
  const post_id = req.body.post_id;
  const sql_get = `SELECT comments_id FROM post WHERE post_id=${post_id}`;
  db.query(sql_get, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    if (data[0].comments_id !== ",") {
      let commsnts_string = data[0].comments_id;
      commsnts_string = commsnts_string.substring(
        1,
        commsnts_string.length - 1
      );
      commsnts_string = commsnts_string.substring(0, commsnts_string.length);
      commsnts_string = "(" + commsnts_string;
      commsnts_string = commsnts_string + ")";
      const sql = `SELECT c.*,u1.user_name,u1.profile_image,u2.user_name as father_user_name FROM comment c
    JOIN user u1 ON c.post_user_id=u1.user_id
    LEFT JOIN  comment father ON c.father_comment_id=father.comment_id
    LEFT JOIN user u2 ON father.post_user_id=u2.user_id
     WHERE c.comment_id IN ${commsnts_string}
     ORDER BY c.comments_order`;

      db.query(sql, (err, data) => {
        if (err) return res.status(201).json("get data faild");
        res.status(200).json(data);
      });
    } else res.status(200).json([]);
  });
});
app.post("/add_comment", (req, res) => {
  let [date, time] = date_and_time();
  date = date.split(" ")[0];
  time = time.substring(0, 5);
  let comment = req.body.comment;
  if (req.body.father_comment_id !== -1)
    comment = comment.substring(comment.indexOf(":") + 1);
  let commentdata = {
    date,
    time,
    post_user_id: req.body.post_user_id,
    comment: comment,
    comments_order: req.body.comments_order,
    father_comment_id: req.body.father_comment_id,
    root_comment_id: req.body.root_comment_id,
  };
  const post_id = req.body.post_id;

  const sql_set_order = `UPDATE comment set comments_order=comments_order+1 WHERE comments_order>${commentdata.comments_order}`;

  db.query(sql_set_order, (err, data) => {
    if (err) return res.status(201).json("userdata faild");
    else {
      const sql = `INSERT INTO comment(comment ,post_user_id,date,time,father_comment_id,root_comment_id,comments_order) values ('${
        commentdata.comment
      }',${commentdata.post_user_id},'${commentdata.date}','${
        commentdata.time
      }',${commentdata.father_comment_id},${commentdata.root_comment_id},${
        commentdata.comments_order + 1
      })`;
      db.query(sql, (err, data) => {
        if (err) return res.status(201).json("userdata faild");
        else {
          const last_id = data.insertId;
          commentdata = { ...commentdata, comment_id: last_id };
          const set_comments_sql = `UPDATE post SET comments_id=CONCAT(comments_id,'${last_id},') , comments_number=comments_number+1  WHERE post_id=${post_id}`;
          db.query(set_comments_sql, (err, data) => {
            if (err) return res.status(201).json("set data faild");
            res.status(200).json(commentdata);
          });
        }
      });
    }
  });
});
app.post("/remove_post", (req, res) => {
  const { post_id } = req.body;

  const sql = `DELETE FROM post WHERE post_id=${post_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("remove post faild");

    res.status(200).json(data.affectedRows);
  });
});
app.post("/remove_story", (req, res) => {
  const { story_id } = req.body;

  const sql = `DELETE FROM story WHERE story_id=${story_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("remove story faild");

    res.status(200).json(data.affectedRows);
  });
});

app.post("/remove_comment", (req, res) => {
  const { comment_id } = req.body;

  const sql = `DELETE FROM comment WHERE comment_id=${comment_id} OR root_comment_id=${comment_id} `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("remove comment faild");
    const set_comments_sql = `UPDATE post SET comments_number=comments_number-${data.affectedRows},comments_id=REPLACE(comments_id,',${comment_id},',',')  WHERE comments_id  LIKE '%,${comment_id},%'`;
    db.query(set_comments_sql, (err) => {
      if (err) return res.status(201).json("set data faild");
      res.status(200).json(data.affectedRows);
    });
  });
});

app.post("/get_all_stories", (req, res) => {
  const { user_id, my_user_id } = req.body;

  const sql = `SELECT u.*,s.seen_by
  FROM user u
  JOIN story s ON u.user_id=s.post_user_id
  JOIN(
    SELECT post_user_id,MAX(date) AS last_post_date
    FROM story
     GROUP BY post_user_id
  )
  last_post ON s.post_user_id=last_post.post_user_id AND s.date=last_post.last_post_date And s.date>DATE_SUB(NOW(),INTERVAL 24 HOUR) AND (u.followers_id LIKE '%,${user_id},%' OR u.user_id=${user_id})
  ORDER BY last_post.last_post_date DESC`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    if (data.length > 0) res.status(200).json(data);
  });
});
app.post("/get_my_stories", (req, res) => {
  const { user_id, my_user_id } = req.body;
  const sql = `SELECT s.*,u.profile_image,u.user_name,c.room
  FROM story as s
    LEFT  JOIN chat c ON c.room = CONCAT(${user_id},'-',${my_user_id})  OR c.room = CONCAT(${my_user_id},'-',${user_id})

  JOIN user AS u ON s.post_user_id=u.user_id
  WHERE s.date>DATE_SUB(NOW(),INTERVAL 24 HOUR) AND s.post_user_id=${user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    if (data.length > 0) res.status(200).json(data);
  });
});
app.post("/get_users_who_seen_story", (req, res) => {
  const story_id = req.body.story_id;
  const sql_get = `SELECT seen_by FROM story WHERE story_id=${story_id}`;
  db.query(sql_get, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    if (data[0].seen_by !== ",") {
      let users_string = data[0].seen_by;
      users_string = users_string.substring(1, users_string.length - 1);
      users_string = users_string.substring(0, users_string.length);
      users_string = "(" + users_string;
      users_string = users_string + ")";
      const sql = `SELECT u.user_name,u.profile_image,u.user_id FROM user u
   
     WHERE user_id IN ${users_string}
     `;

      db.query(sql, (err, data) => {
        if (err) return res.status(201).json("get data faild");
        res.status(200).json(data);
      });
    } else res.status(200).json([]);
  });
});
app.post("/get_users", (req, res) => {
  const { user_id, followers_or_followying } = req.body;
  const sql_get = `SELECT * FROM user WHERE user_id=${user_id}`;
  db.query(sql_get, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    let my_data =
      followers_or_followying === "followers"
        ? data[0].followers_id
        : data[0].following_id;
    if (my_data !== ",") {
      let users_string = my_data;
      users_string = users_string.substring(1, users_string.length - 1);
      users_string = users_string.substring(0, users_string.length);
      users_string = "(" + users_string;
      users_string = users_string + ")";
      const sql = `SELECT u.user_name,u.profile_image,u.user_id FROM user u
   
     WHERE user_id IN ${users_string}
     `;

      db.query(sql, (err, data) => {
        if (err) return res.status(201).json("get data faild");
        res.status(200).json(data);
      });
    } else res.status(200).json([]);
  });
});
app.post("/get_users_who_like_post", (req, res) => {
  const post_id = req.body.post_id;
  const sql_get = `SELECT liked_by FROM post WHERE post_id=${post_id}`;
  db.query(sql_get, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    if (data[0].liked_by !== ",") {
      let users_string = data[0].liked_by;
      users_string = users_string.substring(1, users_string.length - 1);
      users_string = users_string.substring(0, users_string.length);
      users_string = "(" + users_string;
      users_string = users_string + ")";
      const sql = `SELECT u.user_name,u.profile_image,u.user_id FROM user u
   
     WHERE user_id IN ${users_string}
     `;

      db.query(sql, (err, data) => {
        if (err) return res.status(201).json("get data faild");
        res.status(200).json(data);
      });
    } else res.status(200).json([]);
  });
});
app.post("/get_is_connected", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT * FROM user WHERE user_id=${user_id}`;
  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("set data failed");
    else res.status(200).json(data[0].is_connected);
  });
});
app.post("/get_massege_number", (req, res) => {
  const { room, other_user_id, date } = req.body;
  const sql = `SELECT * FROM chat_masseges WHERE user_id=${other_user_id} AND room='${room}' AND is_read=0  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("get faild");
    else res.status(200).json(data.length);
  });
});
app.post("/get_is_user_followed", (req, res) => {
  const { my_user_id, other_user_id } = req.body;
  const sql = `SELECT * FROM user WHERE user_id =${user_id}`;

  db.query(sql, (err, data) => {
    if (err || data.length === 0) return res.status(201).json("login faild");
    if (data.length > 0) res.status(200).json(data[0]);
  });
});

app.post("/add_alert", (req, res) => {
  let [date, time] = date_and_time();
  date = date.split(" ")[0];
  time = time.substring(0, 5);
  const { recived_user, alert_user_id, comment_id, alert, post_id } = req.body;
  if (recived_user !== alert_user_id) {
    let is_stoker_alert = req.body.is_stoker_alert ? 1 : 0;

    const sql_is_stoker = `SELECT u.stoke_mode FROM user u WHERE user_id=${recived_user} `;

    db.query(sql_is_stoker, (err, sql_data) => {
      if (!err) {
        if (sql_data[0].stoke_mode.includes("," + alert_user_id + ",")) {
          is_stoker_alert = true;
        } else {
          if (req.body.is_spaciel_alert) return;
        }
        const sql = `INSERT INTO alert(recived_user,alert_user_id, comment_id,post_id, alert, date,time,is_stoker_alert) values (${recived_user},${alert_user_id},${comment_id},${post_id},'${alert}','${date}','${time}',${is_stoker_alert})`;
        db.query(sql, (err, data) => {
          if (err) return res.status(201).json("insert faild");
          io.emit(`set_user_${recived_user}_alerts`, { alert_num: 1 });
          res.status(200).json("succses");
        });
      }
    });
  }
});

app.post("/remove_alert", (req, res) => {
  const { alert_user_id, post_id, alert } = req.body;
  const sql_select = `SELECT is_seen,recived_user,is_stoker_alert FROM alert WHERE alert_user_id=${alert_user_id} AND post_id=${post_id} AND alert='${alert}'`;
  db.query(sql_select, (err, select_data) => {
    if (err) return res.status(201).json("get is seen faild");
    if (select_data[0].is_stoker_alert === 1) {
      axios
        .post(`http://${ip}:8001/add_alert`, {
          recived_user: select_data[0].recived_user,
          post_id: post_id,
          alert_user_id: alert_user_id,
          comment_id: -1,

          alert: "unlike your post!!!",
          is_spaciel_alert: true,
        })
        .then((response) => {
          if (response.status === 200) {
          }
        })
        .catch((err) => console.log(err));
    } else {
      const sql = `DELETE FROM alert WHERE alert_user_id=${alert_user_id} AND post_id=${post_id} AND alert='${alert}'`;
      db.query(sql, (err, data) => {
        if (err) return res.status(201).json("insert faild");
        if (select_data[0].is_seen === 0)
          io.emit(`set_user_${select_data[0].recived_user}_alerts`, {
            alert_num: -1,
          });

        res.status(200).json("succses");
      });
    }
  });
});
app.post("/send_follow_request", (req, res) => {
  const { this_user_id, this_user_name, other_user_id, is_follow_send } =
    req.body;
  let sql;
  if (is_follow_send)
    sql = `INSERT INTO follow_requests(request_user ,recived_user) values (${this_user_id},${other_user_id})`;
  else
    sql = `DELETE FROM follow_requests WHERE request_user=${this_user_id} AND recived_user=${other_user_id}`;
  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("send faild");
    res.status(200).json("succses");
  });
});
app.post("/get_unseen_follow_requests", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT  req_id req_id FROM follow_requests  WHERE recived_user=${user_id} AND is_seen=0`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json(data.length);
  });
});
app.post("/get_unseen_alerts", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT alert_id FROM alert  WHERE recived_user=${user_id} AND is_seen=0`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json(data.length);
  });
});
app.post("/get_all_unseen_stoker_alert", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT alert_id,alert_user_id alert_id FROM alert  WHERE recived_user=${user_id} AND is_stoker_alert=1  AND is_seen=0`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json(data);
  });
});
app.post("/get_stoker_profiile_alert", (req, res) => {
  const { user_id, my_user_id } = req.body;

  const sql = `SELECT a.date FROM alert a  WHERE alert_user_id=${user_id} AND recived_user=${my_user_id} AND alert LIKE '%profile%' AND is_stoker_alert=1  `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json(data);
  });
});

app.post("/get_unseen_masseges", (req, res) => {
  let sum = 0;
  let other_user_id;
  const user_id = req.body.user_id;
  axios
    .post(`http://${ip}:8001/get_all_chats`, {
      user_id,
    })
    .then((response) => {
      if (response.status === 200) {
        response.data.map((item, index) => {
          other_user_id =
            item.user_1_id === user_id ? item.user_2_id : item.user_1_id;
          axios
            .post(`http://${ip}:8001/get_massege_number`, {
              room: item.room,
              other_user_id: other_user_id,
            })
            .then((resp) => {
              if (resp.status === 200) {
                sum = sum + resp.data;
                if (index === response.data.length - 1)
                  res.status(200).json(sum);
              } else console.log("failed getting masseges");
            })
            .catch((err) => console.log(err));
        });
      } else console.log("failed getting masseges");
    })
    .catch((err) => console.log(err));
});
app.post("/get_all_alerts", (req, res) => {
  const { user_id, offset, is_stoker_alert, alert_user_id } = req.body;
  let sql;
  if (is_stoker_alert)
    sql = `SELECT a.*,p.post_id,p.image_path,u.user_name,u.profile_image, c.comment,c.comment_id FROM alert a 
 LEFT JOIN post p ON a.post_id=p.post_id
 LEFT JOIN comment c ON c.comment_id=a.comment_id
 LEFT JOIN user u ON a.alert_user_id=u.user_id
  WHERE recived_user=${user_id} AND is_stoker_alert=1 AND alert_user_id=${alert_user_id}
  ORDER BY a.alert_id DESC
  LIMIT 5 OFFSET ${offset}`;
  else
    sql = `SELECT a.*,p.post_id,p.image_path,u.user_name,u.profile_image, c.comment,c.comment_id FROM alert a 
 LEFT JOIN post p ON a.post_id=p.post_id
 LEFT JOIN comment c ON c.comment_id=a.comment_id
 LEFT JOIN user u ON a.alert_user_id=u.user_id
  WHERE recived_user=${user_id} AND is_stoker_alert=0
  ORDER BY a.alert_id DESC
  LIMIT 5 OFFSET ${offset}`;
  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("failed getting alerts");
    res.status(200).json(data);
  });
});

app.post("/get_all_follow_requests", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT f.*,u.user_name,u.profile_image FROM follow_requests f 
  LEFT JOIN user u ON user_id=f.request_user
  WHERE recived_user=${user_id} `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("failed  getting reqquest");
    res.status(200).json(data);
  });
});
app.post("/get_all_stoker_alerts", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT * FROM alert  WHERE recived_user=${user_id} AND is_stoker_alert=1 AND is_seen=0`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("failed  getting reqquest");
    res.status(200).json(data);
  });
});
app.post("/set_all_follow_requests_to_seen", (req, res) => {
  const user_id = req.body.user_id;
  let sql = `UPDATE follow_requests SET is_seen=1 WHERE recived_user=${user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json("succses");
  });
});
app.post("/set_all_stokers_alerts_to_seen", (req, res) => {
  const { user_id, alert_user_id } = req.body;
  let sql = `UPDATE alert SET is_seen=1 WHERE recived_user=${user_id} AND alert_user_id=${alert_user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json("succses");
  });
});
app.post("/set_all_alerts_to_seen", (req, res) => {
  const { user_id, is_stoker_alert } = req.body;
  let sql = `UPDATE alert SET is_seen=1 WHERE recived_user=${user_id}  AND is_stoker_alert=${
    is_stoker_alert ? 1 : 0
  } AND is_seen=0`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json("succses");
  });
});
app.post("/get_is_send_follow", (req, res) => {
  const { this_user_id, other_user_id, is_follow_send } = req.body;
  const sql = `SELECT * FROM follow_requests  WHERE request_user=${this_user_id} AND recived_user=${other_user_id}`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("no reqquest");
    res.status(200).json(data[0]);
  });
});
app.post("/set_new_follow", async (req, res) => {
  const { recived_user_id, request_user_id } = req.body;

  let sql_user1 = `UPDATE user SET followers=followers+1,followers_id=CONCAT(followers_id,'${request_user_id},') WHERE user_id=${recived_user_id}`;
  let sql_user2 = `UPDATE user SET following=following+1,following_id=CONCAT(following_id,'${recived_user_id},') WHERE user_id=${request_user_id}`;
  db.query(sql_user1, (err, data) => {
    if (err) return res.status(201).json("set data faild");
    else {
      db.query(sql_user2, (err, data) => {
        if (err) return res.status(201).json("set data faild");

        const date = date_and_time()[0];
        const room = `${request_user_id}-${recived_user_id}`;
        const sql_creact_room = `INSERT INTO chat(room,user_1_id,user_2_id,date) SELECT '${room}',${recived_user_id},${request_user_id},'${date}'
            WHERE NOT EXISTS(SELECT 1 FROM chat WHERE room='${room}' OR room='${
          recived_user_id + "-" + request_user_id
        }')`;
        db.query(sql_creact_room, (err) => {
          if (err) return res.status(201).json("insert data faild");
          return res.status(200).json("success");
        });
      });
    }
  });
});
app.post("/remove_follow", async (req, res) => {
  const { user_id, follow_user_id } = req.body;
  let sql_user1 = `UPDATE user SET following=following-1,following_id=REPLACE(following_id,',${user_id},',',') WHERE user_id=${follow_user_id}`;

  let sql_user2 = `UPDATE user SET followers=followers-1,followers_id=REPLACE(followers_id,',${follow_user_id},',',') WHERE user_id=${user_id}`;
  db.query(sql_user1, (err, data) => {
    if (err) return res.status(201).json("set data faild");
    else {
      db.query(sql_user2, (err, data) => {
        if (err) return res.status(201).json("set data faild");
        res.status(200).json("success");
      });
    }
  });
});
app.post("/insert_masseges", (req, res) => {
  const { room, my_user_id, current_msg, is_read, story_id, post_id } =
    req.body;
  const [date, time] = date_and_time();
  let sql = "";

  sql = `INSERT INTO chat_masseges (massege,date,time,user_id,is_read,room,story_id,post_id) VALUES ('${current_msg}','${date}','${time}',${my_user_id},${
    is_read ? 1 : 0
  },'${room}',${story_id},${post_id}) `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("login faild");
    else res.status(200).json("");
  });
});

app.post("/get_chat_date", (req, res) => {
  const { room } = req.body;
  const sql = `SELECT * FROM chat WHERE room='${room}'`;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    else res.status(200).json(data[0]);
  });
});
app.post("/get_all_chats", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT c.room,c.user_1_id,c.user_2_id,MAX(CONCAT(m.date,' ',m.time)) AS latest_massege,u.user_name,u.profile_image,u.user_id
  FROM chat c
  LEFT JOIN chat_masseges m ON c.room=m.room
  LEFT JOIN user u ON c.user_1_id+c.user_2_id-${user_id}=u.user_id

  WHERE c.user_1_id=${user_id}  OR c.user_2_id=${user_id}
  GROUP BY c.room,c.user_1_id,c.user_2_id
  ORDER BY latest_massege DESC `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    else res.status(200).json(data);
  });
});
app.post("/get_all_chats_backup", (req, res) => {
  const user_id = req.body.user_id;
  const sql = `SELECT * FROM chat WHERE user_1_id=${user_id}  OR user_2_id=${user_id} `;

  db.query(sql, (err, data) => {
    if (err) return res.status(201).json("get data faild");
    else res.status(200).json(data);
  });
});

io.on("connection", (socket) => {
  let login_user_id = -1;
  let room = -1;
  console.log(`user connect ${socket.id}`);

  socket.on("user_id_after_login", (user_id) => {
    login_user_id = user_id;
  });
  socket.on("user_is_in_other_user", (data) => {
    axios
      .post(`http://${ip}:8001/add_alert`, {
        recived_user: data.looked_user,
        post_id: -1,
        alert_user_id: data.looking_user,
        comment_id: -1,

        alert: "looking in your profile",
        is_spaciel_alert: true,
      })
      .then((response) => {
        if (response.status === 200) {
        }
      })
      .catch((err) => console.log(err));
  });

  socket.on("user_is_in_other_user_commments", (data) => {
    axios
      .post(`http://${ip}:8001/add_alert`, {
        recived_user: data.looked_user,
        post_id: data.post_id,
        alert_user_id: data.looking_user,
        comment_id: -1,

        alert: "reading your post comments!",
        is_spaciel_alert: true,
      })
      .then((response) => {
        if (response.status === 200) {
        }
      })
      .catch((err) => console.log(err));
  });
  socket.on("user_is_in_other_user_post", (data) => {
    axios
      .post(`http://${ip}:8001/add_alert`, {
        recived_user: data.looked_user,
        post_id: data.post_id,
        alert_user_id: data.looking_user,
        comment_id: -1,

        alert: "looking on your post!",

        is_spaciel_alert: true,
      })
      .then((response) => {
        if (response.status === 200) {
        }
      })
      .catch((err) => console.log(err));
  });
  socket.on("set_private_state", (data) => {
    io.emit(`set_user_${data.user_id}_private_state`, data.is_private);
  });
  socket.on("send_follow_request", (other_user_id) => {
    io.emit(`set_user_${other_user_id}_follow_request`);
  });
  socket.on("remove_follow_request", (other_user_id) => {
    io.emit(`remove_user_${other_user_id}_follow_request`);
  });
  socket.on("join_room", async (data) => {
    await socket.join(data);
    room = data;
    console.log("join to room " + data);
    let users = [];
    const roomUsers = io.sockets.adapter.rooms.get(data);
    if (roomUsers) {
      users = Array.from(roomUsers);
    }

    if (users.length === 2) {
      io.to(data).emit(`everyone_in_the_chat_${room}`);
    }
  });
  app.post("/set_masseges", (req, res) => {
    const room = req.body.room;
    const sql = `UPDATE chat_masseges SET is_read=1 WHERE room='${room}' AND is_read=0 `;
    db.query(sql, (err, data) => {
      if (err) return res.status(201).json("login faild");
      else res.status(200).json("");
    });
  });

  socket.on("set_user_to_home", () => {
    if (login_user_id != -1) {
      axios.post(`http://${ip}:8001/set_current_page`, {
        user_id: login_user_id,
        current_page: "Home",
      });
      axios.post(`http://${ip}:8001/set_is_connected`, {
        user_id: login_user_id,
        is_connected: false,
      });
      io.emit(`set_user_${login_user_id}_is_disconnected`);
    }
  });
  app.post("/get_masseges", (req, res) => {
    const { room, date, time } = req.body;

    const sql = `SELECT m.*,p.image_path as post_path,s.image_path as story_path,u.profile_image as post_profile_image,u.user_name as post_user_name,u.user_id as post_user_id,u.followers_id as post_user_followers,u.is_private as post_user_private FROM chat_masseges m
   LEFT JOIN story s  ON s.story_id=m.story_id
   LEFT JOIN post p ON p.post_id=m.post_id
   LEFT JOIN user u ON u.user_id=p.post_user_id
     WHERE m.room='${room}' AND m.date >= '${date}'`;

    db.query(sql, (err, data) => {
      if (err) return res.status(201).json("get data faild");
      else res.status(200).json(data);
    });
  });
  socket.on("send_msg", (data) => {
    const roomUsers = io.sockets.adapter.rooms.get(data.room);
    let users = [];
    if (roomUsers) {
      users = Array.from(roomUsers);
    }
    if (users.length > 0) data = { ...data, is_recived: true };
    else {
      data = { ...data, is_recived: false };
    }
    socket.to(data.room).emit("recive_msg", { data: data });
  });
  socket.on(`massege_number_plus`, (data) => {
    io.emit(`new_massege_from_user_${data.send_user}_to_${data.recived_user}`);
    io.emit(`new_massege_from_user_to_${data.recived_user}`, data.send_user);
  });
  socket.on(`user_watched_all_stories`, (data) => {
    io.emit(`user_${data.watched_user}_watched`, (post_user = data.post_user));
  });
  socket.on("leave_room", (data) => {
    if (room !== -1) {
      socket.leave(room);
      const roomUsers = io.sockets.adapter.rooms.get(room);
      let users = [];
      if (roomUsers) {
        users = Array.from(roomUsers);
      }
      if (users.length < 2) {
        io.to(room).emit(`not_everyone_in_the_chat_${room}`);
      }
      console.log("user leave room " + room);
    }
  });

  socket.on("disconnect", () => {
    console.log(`user disconnect  ${socket.id}`);
    if (login_user_id != -1) {
      axios.post(`http://${ip}:8001/set_is_connected`, {
        user_id: login_user_id,
        is_connected: false,
      });
      io.emit(`set_user_${login_user_id}_is_disconnected`);
      login_user_id = -1;
    }
  });
});
server.listen(8001, () => {
  console.log("listning");
});
