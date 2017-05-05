<?php
    require_once("Rest.inc.php");

    class API extends REST
    {
        const db_hostname = "localhost:3306";
        const db_username = "api_user";
        const db_password = "pass";
        const db_name = "remidb";

        public $data = "";

        private $db = null;
        private $mysqli = null;
        public function __construct()
        {
            parent::__construct();                // Init parent contructor
            $this->dbConnect();                    // Initiate Database connection
        }

        /*
         *  Connect to Database
        */
        private function dbConnect()
        {
            $this->mysqli = new mysqli(self::db_hostname, self::db_username, self::db_password, self::db_name);
        }

        /*
         * Dynmically call the method based on the query string
         */
        public function processApi()
        {
            $check = strchr($_REQUEST['x'], "/");

            if (strlen($check) > 1) { // id on end, otherwise $check=/
                $id = substr($check, 1, strlen($check)-1);
                $sub = strtolower(trim(str_replace("/", "", $_REQUEST['x'])));
                $func = substr($sub, 0, strlen($sub) - strlen($id));
            } else {
                $id = "";
                $func = strtolower(trim(str_replace("/", "", $_REQUEST['x'])));
            }

            if ((int)method_exists($this, $func) > 0) {
                $this->$func($id);
            } else {
                $this->response('function not found', 404);
            } // If the method not exist with in this class "Page not found".
        }

        private function login()
        {
            if ($this->get_request_method() != "POST") {
                $this->response('', 406);
            }
            $email = $this->_request['email'];
            $password = $this->_request['pwd'];
            if (!empty($email) and !empty($password)) {
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $query="SELECT uid, name, email FROM users WHERE email = '$email' AND password = '".md5($password)."' LIMIT 1";
                    $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                    if ($r->num_rows > 0) {
                        $result = $r->fetch_assoc();
                        // If success everythig is good send header as "OK" and user details
                        $this->response($this->json($result), 200);
                    }
                    $this->response('', 204);    // If no records "No Content" status
                }
            }

            $error = array('status' => "Failed", "msg" => "Invalid Email address or Password");
            $this->response($this->json($error), 400);
        }

// User CRUD functions
        private function users($id)
        //list of users for given family ID
        {
            if ($this->get_request_method() != "GET") {
                $this->response('', 406);
            }

            if ($id <> "") {
                $query="SELECT * FROM users u WHERE family_id = $id order by u.user_id asc";
                $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                if ($r->num_rows > 0) {
                    $result = array();
                    while ($row = $r->fetch_assoc()) {
                        $result[] = $row;
                    }
                    $this->response($this->json($result), 200); // send user details
                }
                $this->response("", 204);    // If no records "No Content" status
            }
        }

        private function insertuser($id)
        {
            //need to add check for duplicate user id
            if ($this->get_request_method() != "POST") {
                $this->response('', 406);
            }
            $user = json_decode(file_get_contents("php://input"), true);
            $column_names = array('user_id', 'family_id','first_name','last_name','nickname','phone_number',
              'email', 'user_role_role_id', 'password', 'pass_exp','locked');
            $keys = array_keys($user);
            $columns = '';
            $values = '';
            foreach ($column_names as $desired_key) { // Check the user received. If blank insert blank into the array.
               if (!in_array($desired_key, $keys)) {
                   $$desired_key = '';
               } else {
                   $$desired_key = $user[$desired_key];
               }
                $columns = $columns.$desired_key.',';
                $values = $values."'".$$desired_key."',";
            }
            $query = "INSERT INTO users (".trim($columns, ',').") VALUES(".trim($values, ',').")";
            if (!empty($customer)) {
                $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                $success = array('status' => "Success", "msg" => "User Created Successfully.", "data" => $user);
                $this->response($this->json($success), 200);
            } else {
                $this->response('', 204);
            }    //"No Content" status
        }

        private function updateuser($uid)
        {
            if ($this->get_request_method() != "POST") {
                $this->response('', 406);
            }
            $user = json_decode(file_get_contents("php://input"), true);


            $id = $user['id'];

            $column_names = array('user_id', 'family_id','first_name','last_name','nickname','phone_number',
              'email', 'user_role_role_id', 'password', 'pass_exp','locked');
            $keys = array_keys($user['user']);
            $columns = '';
            $values = '';
            foreach ($column_names as $desired_key) { // Check the user received. If key does not exist, insert blank into the array.
               if (!in_array($desired_key, $keys)) {
                   $$desired_key = '';
               } else {
                   $$desired_key = $user['user'][$desired_key];
               }
                $columns = $columns.$desired_key."='".$$desired_key."',";
            }
            $query = "UPDATE users SET ".trim($columns, ',')." WHERE user_id='$id'";
            if (!empty($user)) {
                $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                $success = array('status' => "Success", "msg" => "User ".$id." Updated Successfully.", "data" => $user);
                $this->response($this->json($success), 200);
            } else {
                $this->response('', 204);
            }    // "No Content" status
        }

        private function deleteuser($id)
        {
            if ($this->get_request_method() != "DELETE") {
                $this->response('', 406);
            }

            if ($id <> "") {
                $query="DELETE FROM users WHERE user_id = '$id'";
                $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                $success = array('status' => "Success", "msg" => "Successfully deleted one record.");
                $this->response($this->json($success), 200);
            } else {
                $this->response('', 204);
            }    // If no records "No Content" status
        }

// List CRUD functions
//--List Header Funtions
        private function listheadsforfamily($id)
        {
            //List Headers for a given family id
            if ($this->get_request_method() != "GET") {
                $this->response('', 406);
            }

            if ($id <> "") {
                $query="SELECT * FROM list_hdr h WHERE family_family_id = '$id' order by h.listid asc";
                $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                if ($r->num_rows > 0) {
                    $result = array();
                    while ($row = $r->fetch_assoc()) {
                        $result[] = $row;
                    }
                    $this->response($this->json($result), 200); // send user details
                }
                $this->response("", 204);    // If no records "No Content" status
            }
        }

        private function addlisthead()
        {
          if ($this->get_request_method() != "POST") {
              $this->response('', 406);
          }
          $listhead = json_decode(file_get_contents("php://input"), true);

          $column_names = array('family_family_id','listname','starttime','deadline','alarmtype_id',
                'due_sun','due_mon','due_tue','due_wed','due_thu','due_fri','due_sat');

          $keys = array_keys($listhead);
          $columns = '';
          $values = '';
          foreach ($column_names as $desired_key) { // Check the listhead received. If key does not exist, insert blank into the array.
           if (!in_array($desired_key, $keys)) {
               $$desired_key = '';
           } else {
               $$desired_key = $listhead[$desired_key];
           }
              $columns = $columns.$desired_key.',';
              $values = $values."'".$$desired_key."',";
          }
          $query = "INSERT INTO list_hdr(".trim($columns, ',').") VALUES(".trim($values,',').")";


          if (!empty($listhead)) {
              $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
              $id = mysqli_insert_id($this->mysqli);
              $success = array('status' => "Success", "msg" => "list Updated Successfully.", "data" => $listhead);
              $this->response($id, 200);
          } else {
              $this->response('', 204);
          }    // "No Content" status
        }

        private function updatelist()
        {
            if ($this->get_request_method() != "POST") {
                $this->response('', 406);
            }
            $listhead = json_decode(file_get_contents("php://input"), true);
            $id = $listhead['id'];


            $column_names = array('listid', 'family_family_id','listname','starttime','deadline','alarmtype_id',
            'due_sun','due_mon', 'due_tue', 'due_wed', 'due_thu', 'due_fri', 'due_sat');

            $keys = array_keys($listhead['listhead']);
            $columns = '';
            $values = '';
            foreach ($column_names as $desired_key) { // Check the user received. If key does not exist, insert blank into the array.
             if (!in_array($desired_key, $keys)) {
                 $$desired_key = '';
             } else {
                 $$desired_key = $listhead['listhead'][$desired_key];
             }
                $columns = $columns.$desired_key."='".$$desired_key."',";
            }
            $query = "UPDATE list_hdr SET ".trim($columns, ',')." WHERE listid='$id'";
            if (!empty($listhead)) {
                $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                $success = array('status' => "Success", "msg" => "list ".$id." Updated Successfully.", "data" => $user);
                $this->response($this->json($success), 200);
            } else {
                $this->response('', 204);
            }    // "No Content" status

        }


        private function deleteList()
        {
        }

        private function assignUserList()
        {
        }

        private function removeUserList()
        {
        }
//--List Item Functions
        private function listitems($listid)
        {
            // retrieve list items for list id
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }

            if ($listid <> "") {
                $query="SELECT * FROM list_item i WHERE list_hdr_listid = '$listid' order by i.itemno asc";
                $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
                if ($r->num_rows > 0) {
                    $result = array();
                    while ($row = $r->fetch_assoc()) {
                        $result[] = $row;
                    }
                    $this->response($this->json($result), 200); // send user details
                }
                $this->response("", 204);    // If no records "No Content" status
            }
        }
        private function addlistitem()
        {
          if ($this->get_request_method() != "POST") {
              $this->response('', 406);
          }
          $listitem = json_decode(file_get_contents("php://input"), true);

          $column_names = array('list_hdr_listid', 'itemno','item_desc','confirm','notif_type_id','dist_list');

          $keys = array_keys($listitem);
          $columns = '';
          $values = '';
          foreach ($column_names as $desired_key) { // Check the item received. If key does not exist, insert blank into the array.
           if (!in_array($desired_key, $keys)) {
               $$desired_key = '';
           } else {
               $$desired_key = $listitem[$desired_key];
           }
              $columns = $columns.$desired_key.',';
              $values = $values."'".$$desired_key."',";
          }
          $query = "INSERT INTO list_item(".trim($columns, ',').") VALUES(".trim($values,',').")";

          if (!empty($listitem)) {
              $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
              $success = array('status' => "Success", "msg" => "list Updated Successfully.", "data" => $listitem);
              $this->response($this->json($success), 200);
          } else {
              $this->response('', 204);
          }    // "No Content" status
        }

        private function updatelistitem()
        {
          if ($this->get_request_method() != "POST") {
              $this->response('', 406);
          }

          $listitem = json_decode(file_get_contents("php://input"), true);
          $id = ($listitem['id']);
          $itemno = ($listitem['itemno']);
          $column_names = array('list_hdr_listid', 'itemno','item_desc','confirm','notif_type_id','dist_list');


          $keys = array_keys($listitem['listitem']);
          $columns = '';
          $values = '';
          foreach ($column_names as $desired_key) { // Check the item received. If key does not exist, insert blank into the array.
           if (!in_array($desired_key, $keys)) {
               $$desired_key = '';
           } else {
               $$desired_key = $listitem['listitem'][$desired_key];
           }
              $columns = $columns.$desired_key."='".$$desired_key."',";
          }
          $query = "UPDATE list_item SET ".trim($columns, ',')." WHERE list_hdr_listid='$id' AND itemno='$itemno'";
          if (!empty($listitem)) {
              $r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
              $success = array('status' => "Success", "msg" => "list ".$id.", item ".$itemno." Updated Successfully.", "data" => $listitem);
              $this->response($this->json($success), 200);
          } else {
              $this->response('', 204);
          }    // "No Content" status
        }

        private function deletelistitem($id)
        {
            if ($this->get_request_method() != "DELETE") {
                $this->response('', 406);
            }

            $pos = strpos($id, ",");
            $listid = substr($id,0,$pos);

            $itemno = substr($id,$pos+1,strlen($id));

            if(strlen($id) > 0){
				$query="DELETE FROM list_item WHERE list_hdr_listid=$listid AND itemno='$itemno'";
				$r = $this->mysqli->query($query) or die($this->mysqli->error.__LINE__);
				$success = array('status' => "Success", "msg" => "Successfully deleted one record.");
				$this->response($this->json($success),200);
			}else
				$this->response('',204);	// If no records "No Content" status
        }

// List Instance CRUD functions

        /*
         *	Encode array into JSON
        */
        public function json($data)
        {
            if (is_array($data)) {
                return json_encode($data);
            }
        }
    }

    // Initiiate Library

    $api = new API;
    $api->processApi();
