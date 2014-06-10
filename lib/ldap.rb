require 'net-ldap'

class LDAP
  def initialize
    @conn = connect Application::LDAP_CONFIG['auth']['username'],
                    Application::LDAP_CONFIG['auth']['password']
  end

  def authenticate username, password
    search username, %w(dn mail) do |entry|
      yield entry if connect(entry.dn, password).bind
    end
  end

  def details username
    search username, %w(displayname mail whencreated whenchanged) do |entry|
      return  { :username => entry.displayname.first,
                :email => entry.mail.first,
                :creatd_at => Time.parse(entry.whencreated.first),
                :updated_at => Time.parse(entry.whenchanged.first)
              }
    end
  end

  private
    def search username, attributes = nil
      @conn.search(
        :base => Application::LDAP_CONFIG['base'],
        :filter => Net::LDAP::Filter.eq("objectClass", "*") & Net::LDAP::Filter.eq('samaccountname', username),
        :attributes => attributes) do |entry|
        yield entry
        break
      end
      false
    end

    def connect username, password
      Net::LDAP.new :host => Application::LDAP_CONFIG['host'],
                    :port => Application::LDAP_CONFIG['port'],
                    :auth => {
                      :method => :simple,
                      :username => username,
                      :password => password,
                    }
    end
end
